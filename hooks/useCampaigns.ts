'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Campaign, CampaignProduct, CampaignCategory, Category, Product } from '@/lib/types';
import { uploadImage, deleteImage, extractPathFromUrl } from '@/lib/storage';
import { STORAGE_BUCKETS } from '@/lib/constants';
import toast from 'react-hot-toast';

export interface CampaignFormData {
    name: string;
    description: string | null;
    campaign_type: Campaign['campaign_type'];
    discount_type: Campaign['discount_type'];
    discount_value: number;
    max_discount: number | null;
    min_order_amount: number;
    start_date: string;
    end_date: string;
    start_time: string | null;
    end_time: string | null;
    valid_days: number[];
    brand_name: string | null;
    badge_text: string | null;
    badge_color: string;
    background_color: string;
    max_uses: number | null;
    max_uses_per_user: number;
    sort_order: number;
    is_active: boolean;
    is_featured: boolean;
    // For relations
    selected_product_ids?: string[];
    selected_category_ids?: string[];
}

export function useCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select(`
                    *,
                    campaign_products(*, product:products(*)),
                    campaign_categories(*, category:categories(*))
                `)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setCampaigns(data || []);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Kampanyalar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
        fetchCategories();
        fetchProducts();
    }, [fetchCampaigns, fetchCategories, fetchProducts]);

    const createCampaign = async (
        campaignData: CampaignFormData,
        imageFile?: File
    ): Promise<boolean> => {
        try {
            let imageUrl: string | null = null;

            // Upload image if provided
            if (imageFile) {
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${imageFile.name.split('.').pop()}`;
                imageUrl = await uploadImage(STORAGE_BUCKETS.CAMPAIGNS, fileName, imageFile);
            }

            const { selected_product_ids, selected_category_ids, ...dbData } = campaignData;

            const { data: newCampaign, error } = await supabase
                .from('campaigns')
                .insert({
                    ...dbData,
                    image_url: imageUrl,
                })
                .select()
                .single();

            if (error) throw error;

            // Add product relations if campaign_type is 'product'
            if (newCampaign && selected_product_ids && selected_product_ids.length > 0) {
                const productRelations = selected_product_ids.map((productId) => ({
                    campaign_id: newCampaign.id,
                    product_id: productId,
                }));

                const { error: productError } = await supabase
                    .from('campaign_products')
                    .insert(productRelations);

                if (productError) console.error('Error adding product relations:', productError);
            }

            // Add category relations if campaign_type is 'category'
            if (newCampaign && selected_category_ids && selected_category_ids.length > 0) {
                const categoryRelations = selected_category_ids.map((categoryId) => ({
                    campaign_id: newCampaign.id,
                    category_id: categoryId,
                }));

                const { error: categoryError } = await supabase
                    .from('campaign_categories')
                    .insert(categoryRelations);

                if (categoryError) console.error('Error adding category relations:', categoryError);
            }

            // Refresh campaigns to get relations
            await fetchCampaigns();

            toast.success('Kampanya başarıyla oluşturuldu');
            return true;
        } catch (error) {
            console.error('Error creating campaign:', error);
            toast.error('Kampanya oluşturulurken hata oluştu');
            return false;
        }
    };

    const updateCampaign = async (
        id: string,
        campaignData: CampaignFormData,
        newImageFile?: File
    ): Promise<boolean> => {
        try {
            const existingCampaign = campaigns.find((c) => c.id === id);
            let imageUrl: string | null = existingCampaign?.image_url || null;

            // Upload new image if provided
            if (newImageFile) {
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${newImageFile.name.split('.').pop()}`;
                const newImageUrl = await uploadImage(STORAGE_BUCKETS.CAMPAIGNS, fileName, newImageFile);
                if (newImageUrl) imageUrl = newImageUrl;
            }

            const { selected_product_ids, selected_category_ids, ...dbData } = campaignData;

            const { error } = await supabase
                .from('campaigns')
                .update({
                    ...dbData,
                    image_url: imageUrl,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) throw error;

            // Update product relations
            if (campaignData.campaign_type === 'product') {
                // Delete existing relations
                await supabase.from('campaign_products').delete().eq('campaign_id', id);

                // Add new relations
                if (selected_product_ids && selected_product_ids.length > 0) {
                    const productRelations = selected_product_ids.map((productId) => ({
                        campaign_id: id,
                        product_id: productId,
                    }));

                    await supabase.from('campaign_products').insert(productRelations);
                }
            }

            // Update category relations
            if (campaignData.campaign_type === 'category') {
                // Delete existing relations
                await supabase.from('campaign_categories').delete().eq('campaign_id', id);

                // Add new relations
                if (selected_category_ids && selected_category_ids.length > 0) {
                    const categoryRelations = selected_category_ids.map((categoryId) => ({
                        campaign_id: id,
                        category_id: categoryId,
                    }));

                    await supabase.from('campaign_categories').insert(categoryRelations);
                }
            }

            // Delete old image if new one was uploaded
            if (newImageFile && existingCampaign?.image_url) {
                const path = extractPathFromUrl(existingCampaign.image_url, STORAGE_BUCKETS.CAMPAIGNS);
                if (path) await deleteImage(STORAGE_BUCKETS.CAMPAIGNS, path);
            }

            // Refresh campaigns to get updated relations
            await fetchCampaigns();

            toast.success('Kampanya başarıyla güncellendi');
            return true;
        } catch (error) {
            console.error('Error updating campaign:', error);
            toast.error('Kampanya güncellenirken hata oluştu');
            return false;
        }
    };

    const deleteCampaign = async (id: string): Promise<boolean> => {
        try {
            const campaign = campaigns.find((c) => c.id === id);

            const { error } = await supabase.from('campaigns').delete().eq('id', id);

            if (error) throw error;

            // Update state
            setCampaigns((prev) => prev.filter((c) => c.id !== id));

            // Delete image if exists
            if (campaign?.image_url) {
                const path = extractPathFromUrl(campaign.image_url, STORAGE_BUCKETS.CAMPAIGNS);
                if (path) await deleteImage(STORAGE_BUCKETS.CAMPAIGNS, path);
            }

            toast.success('Kampanya başarıyla silindi');
            return true;
        } catch (error) {
            console.error('Error deleting campaign:', error);
            toast.error('Kampanya silinirken hata oluştu');
            return false;
        }
    };

    const toggleCampaignStatus = async (id: string, isActive: boolean): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('campaigns')
                .update({ is_active: isActive, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            // Update state
            setCampaigns((prev) =>
                prev.map((c) => (c.id === id ? { ...c, is_active: isActive } : c))
            );

            toast.success(isActive ? 'Kampanya aktifleştirildi' : 'Kampanya pasifleştirildi');
            return true;
        } catch (error) {
            console.error('Error toggling campaign status:', error);
            toast.error('İşlem sırasında hata oluştu');
            return false;
        }
    };

    const toggleFeatured = async (id: string, isFeatured: boolean): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('campaigns')
                .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            // Update state
            setCampaigns((prev) =>
                prev.map((c) => (c.id === id ? { ...c, is_featured: isFeatured } : c))
            );

            toast.success(isFeatured ? 'Kampanya öne çıkarıldı' : 'Öne çıkarma kaldırıldı');
            return true;
        } catch (error) {
            console.error('Error toggling featured status:', error);
            toast.error('İşlem sırasında hata oluştu');
            return false;
        }
    };

    const updateSortOrder = async (items: { id: string; sort_order: number }[]): Promise<boolean> => {
        try {
            // Optimistic update
            setCampaigns((prev) => {
                const updated = [...prev];
                items.forEach(({ id, sort_order }) => {
                    const idx = updated.findIndex((c) => c.id === id);
                    if (idx !== -1) {
                        updated[idx] = { ...updated[idx], sort_order };
                    }
                });
                return updated.sort((a, b) => a.sort_order - b.sort_order);
            });

            // Batch update
            await Promise.all(
                items.map((item) =>
                    supabase
                        .from('campaigns')
                        .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
                        .eq('id', item.id)
                )
            );

            toast.success('Sıralama güncellendi');
            return true;
        } catch (error) {
            console.error('Error updating sort order:', error);
            toast.error('Sıralama güncellenirken hata oluştu');
            fetchCampaigns();
            return false;
        }
    };

    return {
        campaigns,
        categories,
        products,
        loading,
        fetchCampaigns,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        toggleCampaignStatus,
        toggleFeatured,
        updateSortOrder,
    };
}

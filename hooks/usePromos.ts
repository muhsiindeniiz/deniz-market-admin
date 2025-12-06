'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Promo } from '@/lib/types';
import { uploadImage, deleteImage, extractPathFromUrl } from '@/lib/storage';
import { STORAGE_BUCKETS } from '@/lib/constants';
import toast from 'react-hot-toast';

export function usePromos() {
    const [promos, setPromos] = useState<Promo[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPromos = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('promos').select('*').order('sort_order');

            if (error) throw error;
            setPromos(data || []);
        } catch (error) {
            console.error('Error fetching promos:', error);
            toast.error('Kampanyalar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPromos();
    }, [fetchPromos]);

    const createPromo = async (promoData: Partial<Promo>, imageFile: File): Promise<boolean> => {
        try {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${imageFile.name.split('.').pop()}`;
            const imageUrl = await uploadImage(STORAGE_BUCKETS.PROMOS, fileName, imageFile);

            if (!imageUrl) throw new Error('Image upload failed');

            const { data: newPromo, error } = await supabase
                .from('promos')
                .insert({
                    ...promoData,
                    image_url: imageUrl,
                })
                .select()
                .single();

            if (error) throw error;

            // State'i hemen güncelle
            if (newPromo) {
                setPromos((prev) => [...prev, newPromo].sort((a, b) => a.sort_order - b.sort_order));
            }

            toast.success('Kampanya başarıyla oluşturuldu');
            return true;
        } catch (error) {
            console.error('Error creating promo:', error);
            toast.error('Kampanya oluşturulurken hata oluştu');
            return false;
        }
    };

    const updatePromo = async (
        id: string,
        promoData: Partial<Promo>,
        newImageFile?: File
    ): Promise<boolean> => {
        try {
            let imageUrl: string | null | undefined = promoData.image_url;
            const oldImageUrl = promoData.image_url;

            // Yeni resmi yükle
            if (newImageFile) {
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${newImageFile.name.split('.').pop()}`;
                imageUrl = await uploadImage(STORAGE_BUCKETS.PROMOS, fileName, newImageFile);
            }

            const { data: updatedPromo, error } = await supabase
                .from('promos')
                .update({
                    ...promoData,
                    image_url: imageUrl,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // State'i hemen güncelle
            if (updatedPromo) {
                setPromos((prev) =>
                    prev.map((p) => (p.id === id ? updatedPromo : p)).sort((a, b) => a.sort_order - b.sort_order)
                );
            }

            // Eski resmi sil (arka planda)
            if (newImageFile && oldImageUrl) {
                const path = extractPathFromUrl(oldImageUrl, STORAGE_BUCKETS.PROMOS);
                if (path) await deleteImage(STORAGE_BUCKETS.PROMOS, path);
            }

            toast.success('Kampanya başarıyla güncellendi');
            return true;
        } catch (error) {
            console.error('Error updating promo:', error);
            toast.error('Kampanya güncellenirken hata oluştu');
            return false;
        }
    };

    const deletePromo = async (id: string, imageUrl: string): Promise<boolean> => {
        try {
            const { error } = await supabase.from('promos').delete().eq('id', id);

            if (error) throw error;

            // State'i hemen güncelle
            setPromos((prev) => prev.filter((p) => p.id !== id));

            // Resmi sil (arka planda)
            const path = extractPathFromUrl(imageUrl, STORAGE_BUCKETS.PROMOS);
            if (path) await deleteImage(STORAGE_BUCKETS.PROMOS, path);

            toast.success('Kampanya başarıyla silindi');
            return true;
        } catch (error) {
            console.error('Error deleting promo:', error);
            toast.error('Kampanya silinirken hata oluştu');
            return false;
        }
    };

    const togglePromoStatus = async (id: string, isActive: boolean): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('promos')
                .update({ is_active: isActive, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            // State'i hemen güncelle
            setPromos((prev) =>
                prev.map((p) => (p.id === id ? { ...p, is_active: isActive } : p))
            );

            toast.success(isActive ? 'Kampanya aktifleştirildi' : 'Kampanya pasifleştirildi');
            return true;
        } catch (error) {
            console.error('Error toggling promo status:', error);
            toast.error('İşlem sırasında hata oluştu');
            return false;
        }
    };

    const updateSortOrder = async (items: { id: string; sort_order: number }[]): Promise<boolean> => {
        try {
            // State'i hemen güncelle (optimistic update)
            setPromos((prev) => {
                const updated = [...prev];
                items.forEach(({ id, sort_order }) => {
                    const idx = updated.findIndex((p) => p.id === id);
                    if (idx !== -1) {
                        updated[idx] = { ...updated[idx], sort_order };
                    }
                });
                return updated.sort((a, b) => a.sort_order - b.sort_order);
            });

            // Batch update için Promise.all kullan
            await Promise.all(
                items.map((item) =>
                    supabase
                        .from('promos')
                        .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
                        .eq('id', item.id)
                )
            );

            toast.success('Sıralama güncellendi');
            return true;
        } catch (error) {
            console.error('Error updating sort order:', error);
            toast.error('Sıralama güncellenirken hata oluştu');
            fetchPromos(); // Hata durumunda geri al
            return false;
        }
    };

    return {
        promos,
        loading,
        fetchPromos,
        createPromo,
        updatePromo,
        deletePromo,
        togglePromoStatus,
        updateSortOrder,
    };
}
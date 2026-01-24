// hooks/useProducts.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product, Category } from '@/lib/types';
import { uploadImage, deleteImage, extractPathFromUrl } from '@/lib/storage';
import { STORAGE_BUCKETS, ITEMS_PER_PAGE } from '@/lib/constants';
import toast from 'react-hot-toast';

interface UseProductsOptions {
  categoryId?: string;
  search?: string;
  page?: number;
  skipInitialFetch?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!options.skipInitialFetch);
  const [totalCount, setTotalCount] = useState(0);

  const { categoryId, search, page = 1, skipInitialFetch = false } = options;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, category:categories(*), store:stores(*)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [categoryId, search, page]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    if (!skipInitialFetch) {
      fetchProducts();
    }
    fetchCategories();
  }, [fetchProducts, fetchCategories, skipInitialFetch]);

  const getProduct = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), store:stores(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }, []);

  const createProduct = async (
    productData: Partial<Product>,
    imageFiles: File[]
  ): Promise<boolean> => {
    try {
      const imageUrls: string[] = [];

      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        const url = await uploadImage(STORAGE_BUCKETS.PRODUCTS, fileName, file);
        if (url) imageUrls.push(url);
      }

      const { error } = await supabase.from('products').insert({
        ...productData,
        images: imageUrls,
      });

      if (error) throw error;

      // Kategori item_count güncelle
      if (productData.category_id) {
        await supabase.rpc('increment_category_count', {
          category_id: productData.category_id,
        });
      }

      toast.success('Ürün başarıyla oluşturuldu');
      fetchProducts();
      return true;
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Ürün oluşturulurken hata oluştu');
      return false;
    }
  };

  const updateProduct = async (
    id: string,
    productData: Partial<Product>,
    newImageFiles: File[],
    removedImageUrls: string[]
  ): Promise<boolean> => {
    try {
      // Yeni resimleri yükle
      const newImageUrls: string[] = [];
      for (const file of newImageFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        const url = await uploadImage(STORAGE_BUCKETS.PRODUCTS, fileName, file);
        if (url) newImageUrls.push(url);
      }

      // Mevcut resimlerden silinen olanları çıkar ve yenileri ekle
      const currentImages = (productData.images || []).filter(
        (img) => !removedImageUrls.includes(img)
      );
      const allImages = [...currentImages, ...newImageUrls];

      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update({
          ...productData,
          images: allImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, category:categories(*), store:stores(*)')
        .single();

      if (error) throw error;

      // State'i hemen güncelle
      if (updatedProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updatedProduct : p))
        );
      }

      // Eski resimleri sil (arka planda)
      for (const url of removedImageUrls) {
        const path = extractPathFromUrl(url, STORAGE_BUCKETS.PRODUCTS);
        if (path) await deleteImage(STORAGE_BUCKETS.PRODUCTS, path);
      }

      toast.success('Ürün başarıyla güncellendi');
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Ürün güncellenirken hata oluştu');
      return false;
    }
  };

  const deleteProduct = async (id: string, images: string[]): Promise<boolean> => {
    try {
      // Ürünün kategori bilgisini al (silmeden önce)
      const { data: product } = await supabase
        .from('products')
        .select('category_id')
        .eq('id', id)
        .single();

      const categoryId = product?.category_id;

      // Önce ürünü sil
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      // State'i hemen güncelle (optimistic update)
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotalCount((prev) => prev - 1);

      // Resimleri sil (arka planda)
      for (const url of images) {
        const path = extractPathFromUrl(url, STORAGE_BUCKETS.PRODUCTS);
        if (path) await deleteImage(STORAGE_BUCKETS.PRODUCTS, path);
      }

      // Kategori item_count azalt
      if (categoryId) {
        await supabase.rpc('decrement_category_count', {
          category_id: categoryId,
        });
      }

      toast.success('Ürün başarıyla silindi');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Ürün silinirken hata oluştu');
      // Hata durumunda listeyi yenile
      fetchProducts();
      return false;
    }
  };

  const bulkDeleteProducts = async (ids: string[]): Promise<boolean> => {
    try {
      // Get products info for image deletion and category count update
      const { data: productsToDelete } = await supabase
        .from('products')
        .select('id, images, category_id')
        .in('id', ids);

      // Önce ürünleri sil
      const { error } = await supabase.from('products').delete().in('id', ids);

      if (error) throw error;

      // State'i hemen güncelle
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      setTotalCount((prev) => prev - ids.length);

      // Resimleri sil ve kategori sayılarını güncelle (arka planda)
      if (productsToDelete) {
        // Kategori sayılarını topla
        const categoryCountMap = new Map<string, number>();
        for (const product of productsToDelete) {
          if (product.category_id) {
            categoryCountMap.set(
              product.category_id,
              (categoryCountMap.get(product.category_id) || 0) + 1
            );
          }
          // Resimleri sil
          for (const url of product.images || []) {
            const path = extractPathFromUrl(url, STORAGE_BUCKETS.PRODUCTS);
            if (path) await deleteImage(STORAGE_BUCKETS.PRODUCTS, path);
          }
        }

        // Kategori sayılarını güncelle
        for (const [categoryId, count] of categoryCountMap) {
          for (let i = 0; i < count; i++) {
            await supabase.rpc('decrement_category_count', {
              category_id: categoryId,
            });
          }
        }
      }

      toast.success(`${ids.length} ürün başarıyla silindi`);
      return true;
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      toast.error('Ürünler silinirken hata oluştu');
      fetchProducts();
      return false;
    }
  };

  const bulkUpdateStock = async (ids: string[], stock: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;

      // State'i hemen güncelle
      setProducts((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, stock } : p))
      );

      toast.success(`${ids.length} ürünün stoğu güncellendi`);
      return true;
    } catch (error) {
      console.error('Error bulk updating stock:', error);
      toast.error('Stok güncellenirken hata oluştu');
      return false;
    }
  };

  const bulkToggleFeatured = async (ids: string[], isFeatured: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;

      // State'i hemen güncelle
      setProducts((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, is_featured: isFeatured } : p))
      );

      toast.success(`${ids.length} ürün ${isFeatured ? 'öne çıkarıldı' : 'öne çıkarmadan kaldırıldı'}`);
      return true;
    } catch (error) {
      console.error('Error bulk toggling featured:', error);
      toast.error('İşlem sırasında hata oluştu');
      return false;
    }
  };

  const bulkToggleOnSale = async (ids: string[], isOnSale: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_on_sale: isOnSale, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;

      // State'i hemen güncelle
      setProducts((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, is_on_sale: isOnSale } : p))
      );

      toast.success(`${ids.length} ürün ${isOnSale ? 'indirme alındı' : 'indirimden çıkarıldı'}`);
      return true;
    } catch (error) {
      console.error('Error bulk toggling on sale:', error);
      toast.error('İşlem sırasında hata oluştu');
      return false;
    }
  };

  return {
    products,
    categories,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateStock,
    bulkToggleFeatured,
    bulkToggleOnSale,
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Store } from '@/lib/types';
import { uploadImage, deleteImage, extractPathFromUrl } from '@/lib/storage';
import { STORAGE_BUCKETS } from '@/lib/constants';
import toast from 'react-hot-toast';

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Mağazalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStore = async (
    data: Omit<Store, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count'>,
    logoFile?: File,
    bannerFile?: File
  ) => {
    try {
      let logoUrl = data.logo;
      let bannerUrl = data.banner_image;

      // Upload logo if provided
      if (logoFile) {
        const fileName = `logo-${Date.now()}-${logoFile.name}`;
        logoUrl = await uploadImage(STORAGE_BUCKETS.STORES, fileName, logoFile);
      }

      // Upload banner if provided
      if (bannerFile) {
        const fileName = `banner-${Date.now()}-${bannerFile.name}`;
        bannerUrl = await uploadImage(STORAGE_BUCKETS.STORES, fileName, bannerFile);
      }

      const { data: newStore, error } = await supabase
        .from('stores')
        .insert({
          ...data,
          logo: logoUrl,
          banner_image: bannerUrl,
          rating: 0,
          review_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // State'i hemen güncelle
      if (newStore) {
        setStores((prev) => [newStore, ...prev]);
      }

      toast.success('Mağaza oluşturuldu');
      return true;
    } catch (error: any) {
      console.error('Error creating store:', error);
      toast.error(error.message || 'Mağaza oluşturulurken hata oluştu');
      return false;
    }
  };

  const updateStore = async (
    id: string,
    data: Partial<Store>,
    logoFile?: File,
    bannerFile?: File,
    removeLogo?: boolean,
    removeBanner?: boolean
  ) => {
    try {
      const store = stores.find((s) => s.id === id);
      let logoUrl = data.logo;
      let bannerUrl = data.banner_image;

      // Upload new logo if provided
      if (logoFile) {
        // Delete old logo if exists
        if (store?.logo) {
          const oldPath = extractPathFromUrl(store.logo, STORAGE_BUCKETS.STORES);
          if (oldPath) {
            await deleteImage(STORAGE_BUCKETS.STORES, oldPath);
          }
        }
        const fileName = `logo-${Date.now()}-${logoFile.name}`;
        logoUrl = await uploadImage(STORAGE_BUCKETS.STORES, fileName, logoFile);
      } else if (removeLogo && store?.logo) {
        // Remove logo without uploading new one
        const oldPath = extractPathFromUrl(store.logo, STORAGE_BUCKETS.STORES);
        if (oldPath) {
          await deleteImage(STORAGE_BUCKETS.STORES, oldPath);
        }
        logoUrl = null;
      }

      // Upload new banner if provided
      if (bannerFile) {
        // Delete old banner if exists
        if (store?.banner_image) {
          const oldPath = extractPathFromUrl(store.banner_image, STORAGE_BUCKETS.STORES);
          if (oldPath) {
            await deleteImage(STORAGE_BUCKETS.STORES, oldPath);
          }
        }
        const fileName = `banner-${Date.now()}-${bannerFile.name}`;
        bannerUrl = await uploadImage(STORAGE_BUCKETS.STORES, fileName, bannerFile);
      } else if (removeBanner && store?.banner_image) {
        // Remove banner without uploading new one
        const oldPath = extractPathFromUrl(store.banner_image, STORAGE_BUCKETS.STORES);
        if (oldPath) {
          await deleteImage(STORAGE_BUCKETS.STORES, oldPath);
        }
        bannerUrl = null;
      }

      const { data: updatedStore, error } = await supabase
        .from('stores')
        .update({
          ...data,
          logo: logoUrl,
          banner_image: bannerUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // State'i hemen güncelle
      if (updatedStore) {
        setStores((prev) => prev.map((s) => (s.id === id ? updatedStore : s)));
      }

      toast.success('Mağaza güncellendi');
      return true;
    } catch (error: any) {
      console.error('Error updating store:', error);
      toast.error(error.message || 'Mağaza güncellenirken hata oluştu');
      return false;
    }
  };

  const deleteStore = async (id: string) => {
    try {
      const store = stores.find((s) => s.id === id);

      // Bu mağazaya ait ürün var mı kontrol et
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', id);

      if (productCount && productCount > 0) {
        toast.error(
          `Bu mağazaya ait ${productCount} ürün bulunuyor. Önce ürünleri silmeli veya başka bir mağazaya taşımalısınız.`
        );
        return false;
      }

      // Delete images if exist
      if (store?.logo) {
        const logoPath = extractPathFromUrl(store.logo, STORAGE_BUCKETS.STORES);
        if (logoPath) {
          await deleteImage(STORAGE_BUCKETS.STORES, logoPath);
        }
      }
      if (store?.banner_image) {
        const bannerPath = extractPathFromUrl(store.banner_image, STORAGE_BUCKETS.STORES);
        if (bannerPath) {
          await deleteImage(STORAGE_BUCKETS.STORES, bannerPath);
        }
      }

      const { error } = await supabase.from('stores').delete().eq('id', id);

      if (error) {
        // Foreign key constraint hatası kontrolü
        if (error.code === '23503') {
          toast.error('Bu mağazaya bağlı kayıtlar var, silinemez');
          return false;
        }
        throw error;
      }

      // State'i hemen güncelle
      setStores((prev) => prev.filter((s) => s.id !== id));

      toast.success('Mağaza silindi');
      return true;
    } catch (error: any) {
      console.error('Error deleting store:', error);
      toast.error(error.message || 'Mağaza silinirken hata oluştu');
      return false;
    }
  };

  const toggleStoreStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // State'i hemen güncelle
      setStores((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: isActive } : s)));

      toast.success(isActive ? 'Mağaza aktifleştirildi' : 'Mağaza pasifleştirildi');
    } catch (error) {
      console.error('Error toggling store status:', error);
      toast.error('İşlem sırasında hata oluştu');
    }
  };

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return {
    stores,
    loading,
    createStore,
    updateStore,
    deleteStore,
    toggleStoreStatus,
    refetch: fetchStores,
  };
}

// hooks/useCategories.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Category } from '@/lib/types';
import { uploadImage, deleteImage, extractPathFromUrl } from '@/lib/storage';
import { STORAGE_BUCKETS } from '@/lib/constants';
import toast from 'react-hot-toast';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (
    categoryData: Partial<Category>,
    imageFile?: File
  ): Promise<boolean> => {
    try {
      let imageUrl = null;

      if (imageFile) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${imageFile.name.split('.').pop()}`;
        imageUrl = await uploadImage(STORAGE_BUCKETS.CATEGORIES, fileName, imageFile);
      }

      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          image_url: imageUrl,
          item_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // State'i hemen güncelle
      if (newCategory) {
        setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      }

      toast.success('Kategori başarıyla oluşturuldu');
      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Kategori oluşturulurken hata oluştu');
      return false;
    }
  };

  const updateCategory = async (
    id: string,
    categoryData: Partial<Category>,
    newImageFile?: File,
    removeImage?: boolean
  ): Promise<boolean> => {
    try {
      let imageUrl = categoryData.image_url;
      const oldImageUrl = categoryData.image_url;

      // Yeni resmi yükle
      if (newImageFile) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${newImageFile.name.split('.').pop()}`;
        imageUrl = await uploadImage(STORAGE_BUCKETS.CATEGORIES, fileName, newImageFile);
      } else if (removeImage) {
        imageUrl = null;
      }

      const { data: updatedCategory, error } = await supabase
        .from('categories')
        .update({
          ...categoryData,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // State'i hemen güncelle
      if (updatedCategory) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? updatedCategory : c)).sort((a, b) => a.name.localeCompare(b.name))
        );
      }

      // Eski resmi sil (arka planda)
      if ((newImageFile || removeImage) && oldImageUrl) {
        const path = extractPathFromUrl(oldImageUrl, STORAGE_BUCKETS.CATEGORIES);
        if (path) await deleteImage(STORAGE_BUCKETS.CATEGORIES, path);
      }

      toast.success('Kategori başarıyla güncellendi');
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Kategori güncellenirken hata oluştu');
      return false;
    }
  };

  const deleteCategory = async (id: string, imageUrl?: string | null): Promise<boolean> => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;

      // State'i hemen güncelle
      setCategories((prev) => prev.filter((c) => c.id !== id));

      // Resmi sil (arka planda)
      if (imageUrl) {
        const path = extractPathFromUrl(imageUrl, STORAGE_BUCKETS.CATEGORIES);
        if (path) await deleteImage(STORAGE_BUCKETS.CATEGORIES, path);
      }

      toast.success('Kategori başarıyla silindi');
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Kategori silinirken hata oluştu');
      return false;
    }
  };

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

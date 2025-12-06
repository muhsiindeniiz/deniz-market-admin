'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LoginBenefit } from '@/lib/types';
import toast from 'react-hot-toast';

export function useLoginBenefits() {
  const [benefits, setBenefits] = useState<LoginBenefit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBenefits = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('login_benefits')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setBenefits(data || []);
    } catch (error) {
      console.error('Error fetching login benefits:', error);
      toast.error('Giriş avantajları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBenefit = async (data: Omit<LoginBenefit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newBenefit, error } = await supabase
        .from('login_benefits')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      // State'i hemen güncelle
      if (newBenefit) {
        setBenefits((prev) => [...prev, newBenefit].sort((a, b) => a.sort_order - b.sort_order));
      }

      toast.success('Giriş avantajı oluşturuldu');
      return true;
    } catch (error: any) {
      console.error('Error creating benefit:', error);
      toast.error(error.message || 'Oluşturulurken hata oluştu');
      return false;
    }
  };

  const updateBenefit = async (id: string, data: Partial<LoginBenefit>) => {
    try {
      const { data: updatedBenefit, error } = await supabase
        .from('login_benefits')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // State'i hemen güncelle
      if (updatedBenefit) {
        setBenefits((prev) =>
          prev.map((b) => (b.id === id ? updatedBenefit : b)).sort((a, b) => a.sort_order - b.sort_order)
        );
      }

      toast.success('Giriş avantajı güncellendi');
      return true;
    } catch (error: any) {
      console.error('Error updating benefit:', error);
      toast.error(error.message || 'Güncellenirken hata oluştu');
      return false;
    }
  };

  const deleteBenefit = async (id: string) => {
    try {
      const { error } = await supabase.from('login_benefits').delete().eq('id', id);

      if (error) throw error;

      // State'i hemen güncelle
      setBenefits((prev) => prev.filter((b) => b.id !== id));

      toast.success('Giriş avantajı silindi');
      return true;
    } catch (error: any) {
      console.error('Error deleting benefit:', error);
      toast.error(error.message || 'Silinirken hata oluştu');
      return false;
    }
  };

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('login_benefits')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // State'i hemen güncelle
      setBenefits((prev) => prev.map((b) => (b.id === id ? { ...b, is_active: isActive } : b)));

      toast.success(isActive ? 'Aktifleştirildi' : 'Pasifleştirildi');
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('İşlem sırasında hata oluştu');
    }
  };

  const reorderBenefits = async (reorderedBenefits: LoginBenefit[]) => {
    try {
      const updates = reorderedBenefits.map((benefit, index) => ({
        id: benefit.id,
        sort_order: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('login_benefits')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      setBenefits(reorderedBenefits.map((b, i) => ({ ...b, sort_order: i + 1 })));
      toast.success('Sıralama güncellendi');
    } catch (error) {
      console.error('Error reordering benefits:', error);
      toast.error('Sıralama güncellenirken hata oluştu');
      fetchBenefits();
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, [fetchBenefits]);

  return {
    benefits,
    loading,
    createBenefit,
    updateBenefit,
    deleteBenefit,
    toggleStatus,
    reorderBenefits,
    refetch: fetchBenefits,
  };
}

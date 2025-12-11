'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { WheelPrize } from '@/lib/types';
import toast from 'react-hot-toast';

export function useWheelPrizes() {
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrizes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wheel_prizes')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPrizes(data || []);
    } catch (error) {
      console.error('Error fetching wheel prizes:', error);
      toast.error('Çark ödülleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrizes();
  }, [fetchPrizes]);

  const createPrize = async (prizeData: Partial<WheelPrize>): Promise<boolean> => {
    try {
      const { data: newPrize, error } = await supabase
        .from('wheel_prizes')
        .insert(prizeData)
        .select()
        .single();

      if (error) throw error;

      if (newPrize) {
        setPrizes((prev) => [...prev, newPrize].sort((a, b) => a.sort_order - b.sort_order));
      }

      toast.success('Ödül başarıyla oluşturuldu');
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      console.error('Error creating wheel prize:', err?.message || err);
      toast.error(err?.message || 'Ödül oluşturulurken hata oluştu');
      return false;
    }
  };

  const updatePrize = async (id: string, prizeData: Partial<WheelPrize>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('wheel_prizes')
        .update({
          ...prizeData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // State'i güncelle
      setPrizes((prev) =>
        prev
          .map((p) => (p.id === id ? { ...p, ...prizeData, updated_at: new Date().toISOString() } : p))
          .sort((a, b) => a.sort_order - b.sort_order)
      );

      toast.success('Ödül başarıyla güncellendi');
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      console.error('Error updating wheel prize:', err?.message || err);
      toast.error(err?.message || 'Ödül güncellenirken hata oluştu');
      return false;
    }
  };

  const deletePrize = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('wheel_prizes').delete().eq('id', id);

      if (error) throw error;

      setPrizes((prev) => prev.filter((p) => p.id !== id));

      toast.success('Ödül başarıyla silindi');
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      console.error('Error deleting wheel prize:', err?.message || err);
      toast.error(err?.message || 'Ödül silinirken hata oluştu');
      return false;
    }
  };

  const togglePrizeStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('wheel_prizes')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setPrizes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: isActive } : p))
      );

      toast.success(isActive ? 'Ödül aktifleştirildi' : 'Ödül pasifleştirildi');
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      console.error('Error toggling prize status:', err?.message || err);
      toast.error(err?.message || 'İşlem sırasında hata oluştu');
      return false;
    }
  };

  const getTotalProbability = (): number => {
    return prizes
      .filter((p) => p.is_active)
      .reduce((sum, p) => sum + p.probability, 0);
  };

  return {
    prizes,
    loading,
    fetchPrizes,
    createPrize,
    updatePrize,
    deletePrize,
    togglePrizeStatus,
    getTotalProbability,
  };
}

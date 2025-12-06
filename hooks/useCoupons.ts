// hooks/useCoupons.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Coupon } from '@/lib/types';
import toast from 'react-hot-toast';

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Kuponlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const createCoupon = async (couponData: Partial<Coupon>): Promise<boolean> => {
    try {
      const { data: newCoupon, error } = await supabase
        .from('coupons')
        .insert(couponData)
        .select()
        .single();

      if (error) throw error;

      // State'i hemen güncelle
      if (newCoupon) {
        setCoupons((prev) => [newCoupon, ...prev]);
      }

      toast.success('Kupon başarıyla oluşturuldu');
      return true;
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      // Duplicate key hatası kontrolü
      if (error?.code === '23505') {
        toast.error('Bu kupon kodu zaten kullanılıyor. Lütfen farklı bir kupon kodu deneyin.');
      } else {
        toast.error('Kupon oluşturulurken hata oluştu');
      }
      return false;
    }
  };

  const updateCoupon = async (id: string, couponData: Partial<Coupon>): Promise<boolean> => {
    try {
      const { data: updatedCoupon, error } = await supabase
        .from('coupons')
        .update({
          ...couponData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // State'i hemen güncelle
      if (updatedCoupon) {
        setCoupons((prev) => prev.map((c) => (c.id === id ? updatedCoupon : c)));
      }

      toast.success('Kupon başarıyla güncellendi');
      return true;
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      // Duplicate key hatası kontrolü
      if (error?.code === '23505') {
        toast.error('Bu kupon kodu zaten kullanılıyor. Lütfen farklı bir kupon kodu deneyin.');
      } else {
        toast.error('Kupon güncellenirken hata oluştu');
      }
      return false;
    }
  };

  const deleteCoupon = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);

      if (error) throw error;

      // State'i hemen güncelle
      setCoupons((prev) => prev.filter((c) => c.id !== id));

      toast.success('Kupon başarıyla silindi');
      return true;
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Kupon silinirken hata oluştu');
      return false;
    }
  };

  const toggleCouponStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // State'i hemen güncelle
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: isActive } : c))
      );

      toast.success(isActive ? 'Kupon aktifleştirildi' : 'Kupon pasifleştirildi');
      return true;
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      toast.error('İşlem sırasında hata oluştu');
      return false;
    }
  };

  return {
    coupons,
    loading,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
  };
}

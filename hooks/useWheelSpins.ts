'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { WheelSpin } from '@/lib/types';
import toast from 'react-hot-toast';

interface WheelSpinStats {
  totalSpins: number;
  totalCouponsGenerated: number;
  spinsByPrizeType: Record<string, number>;
  thisWeekSpins: number;
  thisMonthSpins: number;
}

export function useWheelSpins() {
  const [spins, setSpins] = useState<WheelSpin[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WheelSpinStats | null>(null);

  const fetchSpins = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wheel_spins')
        .select(`
          *,
          user:users(id, full_name, email),
          prize:wheel_prizes(id, label, prize_type, prize_value, color, icon),
          coupon:coupons(id, code, discount_type, discount_value, is_active)
        `)
        .order('spun_at', { ascending: false });

      if (error) throw error;
      setSpins(data || []);
    } catch (error) {
      console.error('Error fetching wheel spins:', error);
      toast.error('Çark çevirme geçmişi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const now = new Date();
      const currentWeek = getWeekNumber(now);
      const currentYear = now.getFullYear();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Tüm spinleri al
      const { data: allSpins, error: spinsError } = await supabase
        .from('wheel_spins')
        .select(`
          id,
          coupon_id,
          week_number,
          year,
          spun_at,
          prize:wheel_prizes(prize_type)
        `);

      if (spinsError) throw spinsError;

      const totalSpins = allSpins?.length || 0;
      const totalCouponsGenerated = allSpins?.filter((s) => s.coupon_id !== null).length || 0;
      const thisWeekSpins =
        allSpins?.filter((s) => s.week_number === currentWeek && s.year === currentYear).length ||
        0;
      const thisMonthSpins =
        allSpins?.filter((s) => new Date(s.spun_at) >= new Date(startOfMonth)).length || 0;

      // Prize type'a göre gruplama
      const spinsByPrizeType: Record<string, number> = {};
      allSpins?.forEach((spin) => {
        const prize = spin.prize as { prize_type: string }[] | { prize_type: string } | null;
        const prizeType = Array.isArray(prize) ? prize[0]?.prize_type : prize?.prize_type;
        spinsByPrizeType[prizeType || 'unknown'] = (spinsByPrizeType[prizeType || 'unknown'] || 0) + 1;
      });

      setStats({
        totalSpins,
        totalCouponsGenerated,
        spinsByPrizeType,
        thisWeekSpins,
        thisMonthSpins,
      });
    } catch (error) {
      console.error('Error fetching wheel spin stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchSpins();
    fetchStats();
  }, [fetchSpins, fetchStats]);

  const deleteSpin = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('wheel_spins').delete().eq('id', id);

      if (error) throw error;

      setSpins((prev) => prev.filter((s) => s.id !== id));

      toast.success('Çark çevirme kaydı silindi');
      return true;
    } catch (error) {
      console.error('Error deleting wheel spin:', error);
      toast.error('Kayıt silinirken hata oluştu');
      return false;
    }
  };

  return {
    spins,
    loading,
    stats,
    fetchSpins,
    fetchStats,
    deleteSpin,
  };
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

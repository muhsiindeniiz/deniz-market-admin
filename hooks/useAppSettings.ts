'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AppSetting } from '@/lib/types';
import toast from 'react-hot-toast';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;

      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching app settings:', error);
      toast.error('Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = async (id: string, value: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // State'i hemen güncelle
      setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)));
      toast.success('Ayar güncellendi');
      return true;
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast.error(error.message || 'Ayar güncellenirken hata oluştu');
      return false;
    }
  };

  const updateMultipleSettings = async (updates: { id: string; value: string }[]) => {
    try {
      // State'i hemen güncelle (optimistic update)
      setSettings((prev) =>
        prev.map((s) => {
          const update = updates.find((u) => u.id === s.id);
          return update ? { ...s, value: update.value } : s;
        })
      );

      // Update each setting sequentially and check for errors
      for (const { id, value } of updates) {
        const { error } = await supabase
          .from('app_settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          console.error('Error updating setting:', id, error);
          throw error;
        }
      }

      toast.success('Ayarlar güncellendi');
      return true;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast.error(error.message || 'Ayarlar güncellenirken hata oluştu');
      await fetchSettings(); // Hata durumunda geri al
      return false;
    }
  };

  const createSetting = async (data: {
    key: string;
    value: string;
    value_type: 'string' | 'number' | 'boolean' | 'json';
    description: string;
  }) => {
    try {
      const { data: created, error } = await supabase
        .from('app_settings')
        .insert({
          ...data,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      if (created) {
        setSettings((prev) => [...prev, created].sort((a, b) => a.key.localeCompare(b.key)));
      }
      toast.success('Ayar oluşturuldu');
      return true;
    } catch (error: any) {
      console.error('Error creating setting:', error);
      toast.error(error.message || 'Ayar oluşturulurken hata oluştu');
      return false;
    }
  };

  const deleteSetting = async (id: string) => {
    try {
      const { error } = await supabase.from('app_settings').delete().eq('id', id);

      if (error) throw error;

      setSettings((prev) => prev.filter((s) => s.id !== id));
      toast.success('Ayar silindi');
      return true;
    } catch (error: any) {
      console.error('Error deleting setting:', error);
      toast.error(error.message || 'Ayar silinirken hata oluştu');
      return false;
    }
  };

  const toggleSettingStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: isActive } : s)));
      toast.success(isActive ? 'Ayar aktifleştirildi' : 'Ayar pasifleştirildi');
    } catch (error) {
      console.error('Error toggling setting status:', error);
      toast.error('İşlem sırasında hata oluştu');
    }
  };

  const getSetting = (key: string) => {
    return settings.find((s) => s.key === key);
  };

  const getSettingValue = (key: string, defaultValue: string = '') => {
    const setting = getSetting(key);
    return setting?.value || defaultValue;
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    updateSetting,
    updateMultipleSettings,
    createSetting,
    deleteSetting,
    toggleSettingStatus,
    getSetting,
    getSettingValue,
    refetch: fetchSettings,
  };
}

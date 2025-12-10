'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Notification } from '@/lib/types';
import { sendPushNotification, cancelPushNotification } from '@/lib/onesignal';
import toast from 'react-hot-toast';

interface UseNotificationsOptions {
  page?: number;
  type?: 'order' | 'promotion' | 'general';
  userId?: string;
}

interface UserBasic {
  id: string;
  full_name: string | null;
  email: string;
}

interface NotificationWithUser extends Notification {
  user?: UserBasic;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { page = 1, type, userId } = options;
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([]);
  const [users, setUsers] = useState<UserBasic[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    order: 0,
    promotion: 0,
    general: 0,
  });

  const pageSize = 10;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select(
          `
          *,
          user:users (
            id,
            full_name,
            email
          )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      setNotifications(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Bildirimler yuklenirken hata olustu');
    } finally {
      setLoading(false);
    }
  }, [page, type, userId]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('type, is_read');

      if (error) throw error;

      const allNotifications = data || [];
      const total = allNotifications.length;
      const unread = allNotifications.filter((n) => !n.is_read).length;
      const order = allNotifications.filter((n) => n.type === 'order').length;
      const promotion = allNotifications.filter((n) => n.type === 'promotion').length;
      const general = allNotifications.filter((n) => n.type === 'general').length;

      setStats({ total, unread, order, promotion, general });
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  }, []);

  const createNotification = async (data: {
    title: string;
    message: string;
    type: 'order' | 'promotion' | 'general';
    user_ids?: string[];
    send_to_all?: boolean;
    push_options?: Record<string, unknown>;
  }) => {
    try {
      const { title, message, type: notificationType, user_ids, send_to_all, push_options } = data;

      let targetUserIds: string[] = [];

      if (send_to_all) {
        const { data: allUsers, error } = await supabase.from('users').select('id');
        if (error) throw error;
        targetUserIds = (allUsers || []).map((u) => u.id);
      } else if (user_ids && user_ids.length > 0) {
        targetUserIds = user_ids;
      } else {
        throw new Error('Lutfen en az bir kullanici secin veya tumune gonder secenegini isaretleyin');
      }

      // 1. Send push notification via OneSignal first to get the notification ID
      let onesignalId: string | null = null;
      let pushWarning: string | null = null;
      try {
        const pushPayload = {
          title,
          message,
          data: { type: notificationType },
          ...(send_to_all
            ? { included_segments: ['Subscribed Users'] }
            : { include_external_user_ids: targetUserIds }),
          // Merge additional push options (icon, color, priority, scheduling, etc.)
          ...push_options,
        };

        const pushResult = await sendPushNotification(pushPayload) as { id?: string; warning?: string; recipients?: number };
        onesignalId = pushResult.id || null;

        // Check for warning (e.g., no subscribers)
        if (pushResult.warning) {
          pushWarning = pushResult.warning;
        }
      } catch (pushError) {
        console.error('Push notification failed:', pushError);
        toast.error('Push bildirim gonderilemedi (OneSignal hatasi)');
      }

      // 2. Save notifications to Supabase with OneSignal ID
      const notificationRecords = targetUserIds.map((uId) => ({
        user_id: uId,
        title,
        message,
        type: notificationType,
        is_read: false,
        data: null,
        onesignal_id: onesignalId,
      }));

      const { error } = await supabase.from('notifications').insert(notificationRecords);

      if (error) throw error;

      if (pushWarning) {
        toast.success(`${targetUserIds.length} kullaniciya uygulama ici bildirim gonderildi`);
        toast(pushWarning, { icon: '⚠️', duration: 5000 });
      } else if (onesignalId) {
        toast.success(`${targetUserIds.length} kullaniciya bildirim gonderildi (Push + In-App)`);
      } else {
        toast.success(`${targetUserIds.length} kullaniciya uygulama ici bildirim gonderildi`);
      }

      fetchNotifications();
      fetchStats();
      return true;
    } catch (error: any) {
      console.error('Error creating notification:', error);
      toast.error(error.message || 'Bildirim olusturulurken hata olustu');
      return false;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Get notification info before deleting (for stats update and OneSignal cancellation)
      const notificationToDelete = notifications.find((n) => n.id === id);

      // Cancel from OneSignal if it has an onesignal_id
      if (notificationToDelete?.onesignal_id) {
        try {
          await cancelPushNotification(notificationToDelete.onesignal_id);
        } catch (cancelError) {
          console.error('Failed to cancel OneSignal notification:', cancelError);
          // Continue with deletion even if OneSignal cancel fails
        }
      }

      const { error } = await supabase.from('notifications').delete().eq('id', id);

      if (error) throw error;

      // Update state immediately
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((prev) => prev - 1);

      // Update stats
      if (notificationToDelete) {
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
          unread: notificationToDelete.is_read ? prev.unread : prev.unread - 1,
          [notificationToDelete.type]: prev[notificationToDelete.type] - 1,
        }));
      }

      toast.success('Bildirim silindi');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Bildirim silinirken hata olustu');
    }
  };

  const deleteMultipleNotifications = async (ids: string[]) => {
    try {
      // Get notifications to delete
      const notificationsToDelete = notifications.filter((n) => ids.includes(n.id));

      // Collect unique OneSignal IDs to cancel
      const onesignalIds = [...new Set(
        notificationsToDelete
          .map((n) => n.onesignal_id)
          .filter((id): id is string => id !== null)
      )];

      // Cancel from OneSignal
      for (const onesignalId of onesignalIds) {
        try {
          await cancelPushNotification(onesignalId);
        } catch (cancelError) {
          console.error('Failed to cancel OneSignal notification:', onesignalId, cancelError);
          // Continue with other cancellations
        }
      }

      const { error } = await supabase.from('notifications').delete().in('id', ids);

      if (error) throw error;

      // Update state immediately
      setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
      setTotalCount((prev) => prev - ids.length);

      // Update stats
      if (notificationsToDelete.length > 0) {
        const unreadCount = notificationsToDelete.filter((n) => !n.is_read).length;
        const orderCount = notificationsToDelete.filter((n) => n.type === 'order').length;
        const promotionCount = notificationsToDelete.filter((n) => n.type === 'promotion').length;
        const generalCount = notificationsToDelete.filter((n) => n.type === 'general').length;

        setStats((prev) => ({
          total: prev.total - notificationsToDelete.length,
          unread: prev.unread - unreadCount,
          order: prev.order - orderCount,
          promotion: prev.promotion - promotionCount,
          general: prev.general - generalCount,
        }));
      }

      toast.success(`${ids.length} bildirim silindi`);
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast.error('Bildirimler silinirken hata olustu');
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', ids);

      if (error) throw error;

      // Update state immediately
      const unreadCount = notifications.filter((n) => ids.includes(n.id) && !n.is_read).length;

      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n))
      );

      setStats((prev) => ({
        ...prev,
        unread: prev.unread - unreadCount,
      }));

      toast.success('Bildirimler okundu olarak isaretlendi');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Islem sirasinda hata olustu');
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchStats();
    fetchUsers();
  }, [fetchNotifications, fetchStats, fetchUsers]);

  return {
    notifications,
    users,
    totalCount,
    loading,
    stats,
    pageSize,
    createNotification,
    deleteNotification,
    deleteMultipleNotifications,
    markAsRead,
    refetch: fetchNotifications,
  };
}

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface OrderNotification {
  id: string;
  order_number: string;
  total_amount: number;
  created_at: string;
  isRead: boolean;
}

interface OrderNotificationContextType {
  notifications: OrderNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const OrderNotificationContext = createContext<OrderNotificationContextType | undefined>(undefined);

export function OrderNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Notification sound URL
  const NOTIFICATION_SOUND_URL = 'https://cdn.pixabay.com/audio/2025/07/04/audio_9dcd152e4d.mp3';

  // Initialize audio
  useEffect(() => {
    // Create audio element with external URL
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.8;
    audioRef.current.crossOrigin = 'anonymous';

    // Preload the audio
    audioRef.current.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    logger.log('Attempting to play notification sound...');

    // Create a new audio instance each time to avoid issues
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.8;

    audio.play()
      .then(() => {
        logger.log('Notification sound played successfully');
      })
      .catch((error) => {
        logger.log('Audio playback failed:', error.message);
      });
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    logger.log('Setting up realtime subscription for orders...');

    // Use a simpler channel setup
    const channel = supabase
      .channel('db-orders-changes')
      .on<{
        id: string;
        order_number: string;
        total_amount: number;
        created_at: string;
      }>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          logger.log('🔔 NEW ORDER RECEIVED:', payload);

          const newOrder = payload.new;

          // Add new notification
          const notification: OrderNotification = {
            id: newOrder.id,
            order_number: newOrder.order_number,
            total_amount: newOrder.total_amount,
            created_at: newOrder.created_at,
            isRead: false,
          };

          logger.log('Adding notification:', notification);
          setNotifications((prev) => [notification, ...prev].slice(0, 50));

          // Show toast notification
          toast.success(`Yeni Sipariş: #${newOrder.order_number}`, {
            duration: 5000,
            icon: '🛒',
          });

          // Play sound
          playNotificationSound();
        }
      );

    channel.subscribe((status, err) => {
      logger.log('Realtime subscription status:', status);
      if (err) {
        logger.error('Realtime subscription error:', err);
      }
      if (status === 'SUBSCRIBED') {
        logger.log('✅ Successfully subscribed to orders realtime!');
      }
    });

    channelRef.current = channel;

    return () => {
      logger.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [playNotificationSound]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <OrderNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </OrderNotificationContext.Provider>
  );
}

export function useOrderNotifications() {
  const context = useContext(OrderNotificationContext);
  if (context === undefined) {
    throw new Error('useOrderNotifications must be used within an OrderNotificationProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface ChatNotification {
  id: string;
  order_id: string;
  order_number: string;
  message: string;
  created_at: string;
  isRead: boolean;
}

interface ChatNotificationContextType {
  notifications: ChatNotification[];
  unreadCount: number;
  totalUnreadMessages: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const ChatNotificationContext = createContext<ChatNotificationContextType | undefined>(undefined);

export function ChatNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Use local message sound
  const NOTIFICATION_SOUND_URL = '/sounds/message-sound.mp3';

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.8;
    audioRef.current.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Fetch initial unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_type', 'user')
          .eq('is_read', false);

        if (error) throw error;
        setTotalUnreadMessages(count || 0);
      } catch (error) {
        logger.error('Error fetching unread chat count:', error);
      }
    };

    fetchUnreadCount();
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    logger.log('Attempting to play chat notification sound...');

    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.8;

    audio.play()
      .then(() => {
        logger.log('Chat notification sound played successfully');
      })
      .catch((error) => {
        logger.log('Audio playback failed:', error.message);
      });
  }, []);

  // Setup realtime subscription for all chat messages
  useEffect(() => {
    logger.log('Setting up realtime subscription for chat messages...');

    const channel = supabase
      .channel('db-chat-messages-changes')
      .on<{
        id: string;
        order_id: string;
        sender_type: string;
        message: string;
        created_at: string;
        is_read: boolean;
      }>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: 'sender_type=eq.user',
        },
        async (payload) => {
          logger.log('🔔 NEW CHAT MESSAGE RECEIVED:', payload);

          const newMessage = payload.new;

          // Fetch order number for the notification
          const { data: order } = await supabase
            .from('orders')
            .select('order_number')
            .eq('id', newMessage.order_id)
            .single();

          const notification: ChatNotification = {
            id: newMessage.id,
            order_id: newMessage.order_id,
            order_number: order?.order_number || 'Bilinmeyen',
            message: newMessage.message,
            created_at: newMessage.created_at,
            isRead: false,
          };

          logger.log('Adding chat notification:', notification);
          setNotifications((prev) => [notification, ...prev].slice(0, 50));
          setTotalUnreadMessages((prev) => prev + 1);

          // Show toast notification
          toast.success(
            `Yeni Mesaj: #${notification.order_number}`,
            {
              duration: 5000,
              icon: '💬',
            }
          );

          // Play sound
          playNotificationSound();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          // Update unread count when messages are marked as read
          if (payload.new.is_read && !payload.old.is_read && payload.new.sender_type === 'user') {
            setTotalUnreadMessages((prev) => Math.max(0, prev - 1));
          }
        }
      );

    channel.subscribe((status, err) => {
      logger.log('Chat realtime subscription status:', status);
      if (err) {
        logger.error('Chat realtime subscription error:', err);
      }
      if (status === 'SUBSCRIBED') {
        logger.log('✅ Successfully subscribed to chat messages realtime!');
      }
    });

    channelRef.current = channel;

    return () => {
      logger.log('Cleaning up chat realtime subscription');
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
    <ChatNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        totalUnreadMessages,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </ChatNotificationContext.Provider>
  );
}

export function useChatNotifications() {
  const context = useContext(ChatNotificationContext);
  if (context === undefined) {
    throw new Error('useChatNotifications must be used within a ChatNotificationProvider');
  }
  return context;
}

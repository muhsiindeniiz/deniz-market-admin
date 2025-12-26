'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ChatMessage } from '@/lib/types';
import toast from 'react-hot-toast';
import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

interface UseChatMessagesOptions {
  orderId?: string;
  enableRealtime?: boolean;
}

export function useChatMessages(options: UseChatMessagesOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const { orderId, enableRealtime = true } = options;

  const fetchMessages = useCallback(async () => {
    if (!orderId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      logger.error('Error fetching chat messages:', error);
      toast.error('Mesajlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchMessages();
    }
  }, [orderId, fetchMessages]);

  // Realtime subscription for chat messages
  useEffect(() => {
    if (!enableRealtime || !orderId) return;

    logger.log('Setting up chat messages realtime subscription for order:', orderId);

    const channel = supabase
      .channel(`chat-messages-${orderId}`)
      .on<ChatMessage>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          logger.log('New chat message received:', payload);
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .on<ChatMessage>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          logger.log('Chat message updated:', payload);
          const updatedMessage = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        }
      )
      .subscribe((status, err) => {
        logger.log('Chat messages realtime subscription status:', status);
        if (err) {
          logger.error('Chat messages realtime subscription error:', err);
        }
      });

    channelRef.current = channel;

    return () => {
      logger.log('Cleaning up chat messages realtime subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [enableRealtime, orderId]);

  const sendMessage = useCallback(
    async (message: string): Promise<boolean> => {
      if (!orderId || !message.trim()) return false;

      setSending(true);
      try {
        const { error } = await supabase.from('chat_messages').insert({
          order_id: orderId,
          sender_type: 'store',
          sender_id: '00000000-0000-0000-0000-000000000000', // Store/admin ID
          message: message.trim(),
          is_read: false,
        });

        if (error) throw error;

        return true;
      } catch (error) {
        logger.error('Error sending chat message:', error);
        toast.error('Mesaj gönderilemedi');
        return false;
      } finally {
        setSending(false);
      }
    },
    [orderId]
  );

  const markAsRead = useCallback(async () => {
    if (!orderId) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('order_id', orderId)
        .eq('sender_type', 'user')
        .eq('is_read', false);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender_type === 'user' ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      logger.error('Error marking messages as read:', error);
    }
  }, [orderId]);

  const unreadCount = messages.filter(
    (msg) => msg.sender_type === 'user' && !msg.is_read
  ).length;

  return {
    messages,
    loading,
    sending,
    unreadCount,
    sendMessage,
    markAsRead,
    fetchMessages,
  };
}

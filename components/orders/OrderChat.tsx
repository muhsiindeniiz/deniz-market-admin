'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatMessages } from '@/hooks/useChatMessages';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { MessageCircle, Send, User, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderChatProps {
  orderId: string;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderChat({ orderId }: OrderChatProps) {
  const { messages, loading, sending, unreadCount, sendMessage, markAsRead } =
    useChatMessages({ orderId });
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (unreadCount > 0) {
      markAsRead();
    }
  }, [unreadCount, markAsRead]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Müşteri Mesajları</h3>
        </div>
        <Loading size="sm" text="Mesajlar yükleniyor..." />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900">Müşteri Mesajları</h3>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {unreadCount} yeni
          </span>
        )}
      </div>

      {/* Messages Container */}
      <div className="h-64 overflow-y-auto mb-4 space-y-3 border border-gray-100 rounded-lg p-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Henüz mesaj yok
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2',
                msg.sender_type === 'store' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.sender_type === 'user' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-lg px-3 py-2',
                  msg.sender_type === 'store'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                )}
              >
                <p className="text-sm">{msg.message}</p>
                <p
                  className={cn(
                    'text-xs mt-1',
                    msg.sender_type === 'store' ? 'text-green-100' : 'text-gray-400'
                  )}
                >
                  {formatTime(msg.created_at)}
                </p>
              </div>
              {msg.sender_type === 'store' && (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Store className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Mesajınızı yazın..."
          disabled={sending}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Gönderiliyor...' : 'Gönder'}
        </Button>
      </div>
    </Card>
  );
}

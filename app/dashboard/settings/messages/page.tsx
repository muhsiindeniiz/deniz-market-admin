'use client';

import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { ContactMessage } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Mail, MailOpen, Check, Trash2, User } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  const { messages, loading, markMessageAsRead, markMessageAsResolved, deleteMessage } =
    useSettings();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const handleOpenMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await markMessageAsRead(message.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      await deleteMessage(id);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">İletişim Mesajları</h1>
          <p className="text-gray-500 mt-1">
            Müşteri mesajlarını görüntüleyin
            {unreadCount > 0 && (
              <Badge variant="danger" size="sm">
                {unreadCount} okunmamış
              </Badge>
            )}
          </p>
        </div>
      </div>

      <Card>
        {loading ? (
          <Loading />
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Henüz mesaj yok</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !message.is_read ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleOpenMessage(message)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    message.is_read ? 'bg-gray-100' : 'bg-blue-100'
                  }`}
                >
                  {message.is_read ? (
                    <MailOpen className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Mail className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-medium ${
                        message.is_read ? 'text-gray-900' : 'text-blue-900'
                      }`}
                    >
                      {message.name}
                    </p>
                    {message.is_resolved && (
                      <Badge variant="success" size="sm">
                        <Check className="w-3 h-3 mr-1" />
                        Çözüldü
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{message.subject}</p>
                  <p className="text-sm text-gray-400 truncate">{message.message}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{formatDate(message.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Message Detail Modal */}
      <Modal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title="Mesaj Detayı"
        size="lg"
      >
        {selectedMessage && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                <p className="text-sm text-gray-400">{formatDate(selectedMessage.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedMessage.is_resolved ? (
                  <Badge variant="success">Çözüldü</Badge>
                ) : (
                  <Badge variant="warning">Bekliyor</Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Konu</p>
              <p className="text-gray-900">{selectedMessage.subject}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Mesaj</p>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Button variant="danger" size="sm" onClick={() => handleDelete(selectedMessage.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </Button>
              <div className="flex items-center gap-2">
                {selectedMessage.is_resolved ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      markMessageAsResolved(selectedMessage.id, false);
                      setSelectedMessage({ ...selectedMessage, is_resolved: false });
                    }}
                  >
                    Çözülmedi İşaretle
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      markMessageAsResolved(selectedMessage.id, true);
                      setSelectedMessage({ ...selectedMessage, is_resolved: true });
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Çözüldü İşaretle
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

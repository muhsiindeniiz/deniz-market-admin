'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Loading } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import {
  NOTIFICATION_COLORS,
  PRIORITY_LEVELS,
  IOS_INTERRUPTION_LEVELS,
  NotificationIcon,
  IOSInterruptionLevel,
} from '@/lib/onesignal';
import {
  Bell,
  Send,
  Trash2,
  User,
  ShoppingCart,
  Megaphone,
  Info,
  RefreshCw,
  AlertTriangle,
  Plus,
  Mail,
  CheckCircle,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  Image,
  Volume2,
  Link,
  Clock,
  Palette,
  Smartphone,
} from 'lucide-react';

interface PushSettings {
  // Appearance
  iconType: NotificationIcon;
  accentColor: string;
  bigPictureUrl: string;
  // Sound & Priority
  priority: number;
  iosInterruptionLevel: IOSInterruptionLevel;
  // Actions
  actionUrl: string;
  // Scheduling
  scheduleEnabled: boolean;
  scheduledTime: string;
}

const defaultPushSettings: PushSettings = {
  iconType: 'default',
  accentColor: 'green',
  bigPictureUrl: '',
  priority: 10,
  iosInterruptionLevel: 'active',
  actionUrl: '',
  scheduleEnabled: false,
  scheduledTime: '',
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<'order' | 'promotion' | 'general' | undefined>();
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as 'order' | 'promotion' | 'general',
    selectedUsers: [] as string[],
    sendToAll: false,
  });

  // Push notification settings
  const [pushSettings, setPushSettings] = useState<PushSettings>(defaultPushSettings);

  const {
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
    refetch,
  } = useNotifications({ page, type: typeFilter });

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(notifications.map((n) => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications([...selectedNotifications, id]);
    } else {
      setSelectedNotifications(selectedNotifications.filter((n) => n !== id));
    }
  };

  const handleDeleteClick = (id: string) => {
    setNotificationToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (notificationToDelete) {
      await deleteNotification(notificationToDelete);
      setDeleteModalOpen(false);
      setNotificationToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    await deleteMultipleNotifications(selectedNotifications);
    setSelectedNotifications([]);
    setBulkDeleteModalOpen(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.message) {
      return;
    }

    // Build push settings for the notification
    const pushOptions: Record<string, unknown> = {
      android_accent_color: NOTIFICATION_COLORS[pushSettings.accentColor]?.hex,
      priority: pushSettings.priority,
      ios_interruption_level: pushSettings.iosInterruptionLevel,
    };

    if (pushSettings.bigPictureUrl) {
      pushOptions.big_picture = pushSettings.bigPictureUrl;
      pushOptions.ios_attachments = { image: pushSettings.bigPictureUrl };
    }

    if (pushSettings.actionUrl) {
      pushOptions.url = pushSettings.actionUrl;
      pushOptions.app_url = pushSettings.actionUrl;
    }

    if (pushSettings.scheduleEnabled && pushSettings.scheduledTime) {
      pushOptions.send_after = new Date(pushSettings.scheduledTime).toISOString();
    }

    const success = await createNotification({
      title: formData.title,
      message: formData.message,
      type: formData.type,
      user_ids: formData.sendToAll ? undefined : formData.selectedUsers,
      send_to_all: formData.sendToAll,
      push_options: pushOptions,
    });

    if (success) {
      setCreateModalOpen(false);
      setFormData({
        title: '',
        message: '',
        type: 'general',
        selectedUsers: [],
        sendToAll: false,
      });
      setPushSettings(defaultPushSettings);
      setShowAdvancedSettings(false);
    }
  };

  const handleMarkAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await markAsRead(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4" />;
      case 'promotion':
        return <Megaphone className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-700';
      case 'promotion':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order':
        return 'Siparis';
      case 'promotion':
        return 'Promosyon';
      default:
        return 'Genel';
    }
  };

  const resetModal = () => {
    setCreateModalOpen(false);
    setFormData({
      title: '',
      message: '',
      type: 'general',
      selectedUsers: [],
      sendToAll: false,
    });
    setPushSettings(defaultPushSettings);
    setShowAdvancedSettings(false);
  };

  if (loading && notifications.length === 0) {
    return <Loading size="lg" text="Bildirimler yukleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
          <p className="text-gray-500 mt-1">Musteri bildirimlerini yonetin ve gonderin</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>

          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Bildirim
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Toplam</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
              <p className="text-xs text-gray-500">Okunmamis</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.order}</p>
              <p className="text-xs text-gray-500">Siparis</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.promotion}</p>
              <p className="text-xs text-gray-500">Promosyon</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.general}</p>
              <p className="text-xs text-gray-500">Genel</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions & Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Tur:</span>
              <select
                value={typeFilter || ''}
                onChange={(e) => {
                  setTypeFilter(
                    e.target.value
                      ? (e.target.value as 'order' | 'promotion' | 'general')
                      : undefined
                  );
                  setPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tumu</option>
                <option value="order">Siparis</option>
                <option value="promotion">Promosyon</option>
                <option value="general">Genel</option>
              </select>
            </div>

            {typeFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTypeFilter(undefined);
                  setPage(1);
                }}
              >
                Filtreleri Temizle
              </Button>
            )}
          </div>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAsRead}
              >
                <Eye className="w-4 h-4 mr-2" />
                Okundu Isaretle
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setBulkDeleteModalOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {selectedNotifications.length} Secili Sil
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Henuz bildirim bulunmuyor</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedNotifications.length === notifications.length &&
                          notifications.length > 0
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanici
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Baslik / Mesaj
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tur
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Islemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className={`hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={(e) =>
                            handleSelectNotification(notification.id, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {notification.user?.full_name || 'Bilinmeyen'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {notification.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {notification.message}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(
                            notification.type
                          )}`}
                        >
                          {getTypeIcon(notification.type)}
                          {getTypeLabel(notification.type)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {notification.is_read ? (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <CheckCircle className="w-4 h-4" />
                            Okundu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <Mail className="w-4 h-4" />
                            Okunmadi
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-500">
                          {formatDate(notification.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(notification.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create Notification Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={resetModal}
        title="Yeni Bildirim Gonder"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <Input
            label="Baslik"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Bildirim basligi"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mesaj
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Bildirim mesaji"
              rows={3}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bildirim Turu
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as 'order' | 'promotion' | 'general',
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="general">Genel</option>
              <option value="promotion">Promosyon</option>
              <option value="order">Siparis</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendToAll"
                checked={formData.sendToAll}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sendToAll: e.target.checked,
                    selectedUsers: e.target.checked ? [] : formData.selectedUsers,
                  })
                }
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="sendToAll" className="ml-2 text-sm text-gray-700">
                <span className="font-medium">Tum kullanicilara gonder</span>
                <span className="text-gray-500 ml-1">({users.length} kullanici)</span>
              </label>
            </div>

            {!formData.sendToAll && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanicilar
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selectedUsers: [...formData.selectedUsers, user.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedUsers: formData.selectedUsers.filter(
                                (id) => id !== user.id
                              ),
                            });
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {formData.selectedUsers.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.selectedUsers.length} kullanici secildi
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Advanced Push Settings Toggle */}
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <Settings className="w-4 h-4" />
              Push Bildirim Ayarlari
              {showAdvancedSettings ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showAdvancedSettings && (
              <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                {/* Appearance Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Gorunum
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Vurgu Rengi (Android)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(NOTIFICATION_COLORS).map(([key, { hex, name }]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPushSettings({ ...pushSettings, accentColor: key })}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
                            pushSettings.accentColor === key
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `#${hex.slice(2)}` }}
                          />
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      <Image className="w-3 h-3 inline mr-1" />
                      Buyuk Gorsel URL (Opsiyonel)
                    </label>
                    <input
                      type="url"
                      value={pushSettings.bigPictureUrl}
                      onChange={(e) =>
                        setPushSettings({ ...pushSettings, bigPictureUrl: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Bildirimde gosterilecek buyuk gorsel (1200x600 px onerilen)
                    </p>
                  </div>
                </div>

                {/* Priority Section */}
                <div className="space-y-3 border-t border-gray-200 pt-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Oncelik & Ses
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Android Onceligi
                    </label>
                    <select
                      value={pushSettings.priority}
                      onChange={(e) =>
                        setPushSettings({ ...pushSettings, priority: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {PRIORITY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label} - {level.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      <Smartphone className="w-3 h-3 inline mr-1" />
                      iOS Kesinti Seviyesi
                    </label>
                    <select
                      value={pushSettings.iosInterruptionLevel}
                      onChange={(e) =>
                        setPushSettings({
                          ...pushSettings,
                          iosInterruptionLevel: e.target.value as IOSInterruptionLevel,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {IOS_INTERRUPTION_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label} - {level.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action URL Section */}
                <div className="space-y-3 border-t border-gray-200 pt-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Aksiyon
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tiklaninca Acilacak URL (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={pushSettings.actionUrl}
                      onChange={(e) =>
                        setPushSettings({ ...pushSettings, actionUrl: e.target.value })
                      }
                      placeholder="denizmarket://orders/123 veya https://example.com"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Deep link veya web URL girebilirsiniz
                    </p>
                  </div>
                </div>

                {/* Scheduling Section */}
                <div className="space-y-3 border-t border-gray-200 pt-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Zamanlama
                  </h4>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="scheduleEnabled"
                      checked={pushSettings.scheduleEnabled}
                      onChange={(e) =>
                        setPushSettings({
                          ...pushSettings,
                          scheduleEnabled: e.target.checked,
                          scheduledTime: e.target.checked ? pushSettings.scheduledTime : '',
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="scheduleEnabled" className="text-sm text-gray-700">
                      Ileri tarihte gonder
                    </label>
                  </div>

                  {pushSettings.scheduleEnabled && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Gonderim Zamani
                      </label>
                      <input
                        type="datetime-local"
                        value={pushSettings.scheduledTime}
                        onChange={(e) =>
                          setPushSettings({ ...pushSettings, scheduledTime: e.target.value })
                        }
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={resetModal}
            >
              Iptal
            </Button>
            <Button
              type="submit"
              disabled={
                !formData.title ||
                !formData.message ||
                (!formData.sendToAll && formData.selectedUsers.length === 0)
              }
            >
              <Send className="w-4 h-4 mr-2" />
              Gonder
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Bildirimi Sil"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <p className="text-sm text-red-700">
              Bu islem geri alinamaz. Bildirim kalici olarak silinecektir.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Iptal
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Sil
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title="Toplu Silme"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <p className="text-sm text-red-700">
              {selectedNotifications.length} bildirim kalici olarak silinecektir. Bu islem
              geri alinamaz.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>
              Iptal
            </Button>
            <Button variant="danger" onClick={handleBulkDelete}>
              {selectedNotifications.length} Bildirimi Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

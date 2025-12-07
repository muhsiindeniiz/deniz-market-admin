'use client';

import { useState, useEffect } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Loading } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import {
  Settings,
  Save,
  RefreshCw,
  DollarSign,
  Truck,
  Clock,
  Store,
  Package,
  Plus,
  Trash2,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react';

interface SettingGroup {
  title: string;
  icon: React.ElementType;
  keys: string[];
}

const settingGroups: SettingGroup[] = [
  {
    title: 'Ödeme Ayarları',
    icon: DollarSign,
    keys: ['FREE_DELIVERY_THRESHOLD', 'DELIVERY_FEE', 'MIN_ORDER_AMOUNT', 'FIRST_ORDER_DISCOUNT', 'CURRENCY_SYMBOL', 'CURRENCY_CODE'],
  },
  {
    title: 'Sipariş Ayarları',
    icon: Package,
    keys: ['MAX_ITEMS_PER_ORDER', 'ORDER_PREPARATION_TIME', 'DELIVERY_TIME'],
  },
  {
    title: 'Mağaza Ayarları',
    icon: Store,
    keys: ['STORE_OPEN_TIME', 'STORE_CLOSE_TIME', 'IS_STORE_OPEN'],
  },
];

export default function AppSettingsPage() {
  const { settings, loading, updateSetting, updateMultipleSettings, createSetting, deleteSetting, toggleSettingStatus, refetch } =
    useAppSettings();
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<string | null>(null);
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    value_type: 'string' as 'string' | 'number' | 'boolean' | 'json',
    description: '',
  });

  // Initialize edited values when settings load
  useEffect(() => {
    const values: Record<string, string> = {};
    settings.forEach((s) => {
      values[s.key] = s.value;
    });
    setEditedValues(values);
  }, [settings]);

  const handleValueChange = (key: string, value: string) => {
    setEditedValues({ ...editedValues, [key]: value });
  };

  const hasChanges = () => {
    return settings.some((s) => editedValues[s.key] !== s.value);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = settings
        .filter((s) => editedValues[s.key] !== s.value)
        .map((s) => ({ id: s.id, value: editedValues[s.key] }));

      if (updates.length > 0) {
        await updateMultipleSettings(updates);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetting.key || !newSetting.value) return;

    const success = await createSetting(newSetting);
    if (success) {
      setCreateModalOpen(false);
      setNewSetting({ key: '', value: '', value_type: 'string', description: '' });
    }
  };

  const handleDeleteSetting = async () => {
    if (settingToDelete) {
      await deleteSetting(settingToDelete);
      setDeleteModalOpen(false);
      setSettingToDelete(null);
    }
  };

  const getSettingByKey = (key: string) => {
    return settings.find((s) => s.key === key);
  };

  const renderSettingInput = (key: string) => {
    const setting = getSettingByKey(key);
    if (!setting) return null;

    const value = editedValues[key] || '';

    switch (setting.value_type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleValueChange(key, value === 'true' ? 'false' : 'true')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value === 'true' ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value === 'true' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-600">
              {value === 'true' ? 'Aktif' : 'Pasif'}
            </span>
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleValueChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleValueChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        );
    }
  };

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      FREE_DELIVERY_THRESHOLD: 'Ücretsiz Kargo Limiti (₺)',
      DELIVERY_FEE: 'Standart Kargo Ücreti (₺)',
      MIN_ORDER_AMOUNT: 'Minimum Sipariş Tutarı (₺)',
      FIRST_ORDER_DISCOUNT: 'İlk Sipariş İndirimi (%)',
      MAX_ITEMS_PER_ORDER: 'Sipariş Başına Maks. Ürün',
      ORDER_PREPARATION_TIME: 'Hazırlık Süresi (dk)',
      DELIVERY_TIME: 'Teslimat Süresi (dk)',
      STORE_OPEN_TIME: 'Açılış Saati',
      STORE_CLOSE_TIME: 'Kapanış Saati',
      IS_STORE_OPEN: 'Mağaza Açık',
      CURRENCY_SYMBOL: 'Para Birimi Sembolü',
      CURRENCY_CODE: 'Para Birimi Kodu',
    };
    return labels[key] || key;
  };

  // Get settings not in any group
  const otherSettings = settings.filter(
    (s) => !settingGroups.some((g) => g.keys.includes(s.key))
  );

  if (loading) {
    return <Loading size="lg" text="Uygulama ayarları yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Uygulama Ayarları</h1>
          <p className="text-gray-500 mt-1">Mobil uygulama yapılandırması</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>

          <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ayar
          </Button>

          {hasChanges() && (
            <Button onClick={handleSaveAll} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Bu ayarlar mobil uygulamayı doğrudan etkiler
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Değişiklikler kaydedildiğinde mobil uygulamada anında yansıyacaktır.
            </p>
          </div>
        </div>
      </Card>

      {/* Setting Groups */}
      {settingGroups.map((group) => {
        const Icon = group.icon;
        const groupSettings = group.keys
          .map((key) => getSettingByKey(key))
          .filter(Boolean);

        if (groupSettings.length === 0) return null;

        return (
          <Card key={group.title} className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.keys.map((key) => {
                const setting = getSettingByKey(key);
                if (!setting) return null;

                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getSettingLabel(key)}
                    </label>
                    {setting.description && (
                      <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
                    )}
                    {renderSettingInput(key)}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      {/* Other Settings */}
      {otherSettings.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Diğer Ayarlar</h2>
          </div>

          <div className="space-y-4">
            {otherSettings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{setting.key}</p>
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                      {setting.value_type}
                    </span>
                    {!setting.is_active && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                        Pasif
                      </span>
                    )}
                  </div>
                  {setting.description && (
                    <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-48">{renderSettingInput(setting.key)}</div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSettingStatus(setting.id, !setting.is_active)}
                  >
                    {setting.is_active ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSettingToDelete(setting.id);
                      setDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Özet</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Ücretsiz Kargo</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(Number(editedValues['FREE_DELIVERY_THRESHOLD'] || 0))}+
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Kargo Ücreti</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(Number(editedValues['DELIVERY_FEE'] || 0))}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Teslimat Süresi</p>
            <p className="text-lg font-bold text-purple-600">
              {editedValues['DELIVERY_TIME'] || '45'} dk
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg text-center">
            <Store className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Çalışma Saatleri</p>
            <p className="text-lg font-bold text-orange-600">
              {editedValues['STORE_OPEN_TIME'] || '07:30'} - {editedValues['STORE_CLOSE_TIME'] || '20:00'}
            </p>
          </div>
        </div>
      </Card>

      {/* Create Setting Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Yeni Ayar Ekle"
      >
        <form onSubmit={handleCreateSetting} className="space-y-4">
          <Input
            label="Ayar Anahtarı"
            value={newSetting.key}
            onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
            placeholder="AYAR_ANAHTARI"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Değer Türü
            </label>
            <select
              value={newSetting.value_type}
              onChange={(e) =>
                setNewSetting({
                  ...newSetting,
                  value_type: e.target.value as 'string' | 'number' | 'boolean' | 'json',
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="string">Metin (string)</option>
              <option value="number">Sayı (number)</option>
              <option value="boolean">Evet/Hayır (boolean)</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <Input
            label="Değer"
            value={newSetting.value}
            onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
            placeholder="Ayar değeri"
            required
          />

          <Input
            label="Açıklama"
            value={newSetting.description}
            onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
            placeholder="Bu ayarın ne işe yaradığını açıklayın"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={!newSetting.key || !newSetting.value}>
              Oluştur
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Ayarı Sil"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <p className="text-sm text-red-700">
              Bu işlem geri alınamaz. Bu ayar kalıcı olarak silinecektir.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              İptal
            </Button>
            <Button variant="danger" onClick={handleDeleteSetting}>
              Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ContactInfo } from '@/lib/types';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
const typeOptions = [
  { value: 'phone', label: 'Telefon' },
  { value: 'email', label: 'E-posta' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'address', label: 'Adres' },
];
const iconOptions = [
  { value: 'call-outline', label: '📞 Telefon' },
  { value: 'mail-outline', label: '📧 E-posta' },
  { value: 'logo-whatsapp', label: '💬 WhatsApp' },
  { value: 'location-outline', label: '📍 Konum' },
];
export default function ContactSettingsPage() {
  const { contactInfo, loading, saveContactInfo, deleteContactInfo } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContactInfo | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'phone' as ContactInfo['type'],
    label: '',
    value: '',
    icon: 'call-outline',
    color: '#00AA55',
    sort_order: 0,
    is_active: true,
  });
  const resetForm = () => {
    setFormData({
      type: 'phone',
      label: '',
      value: '',
      icon: 'call-outline',
      color: '#00AA55',
      sort_order: 0,
      is_active: true,
    });
    setEditingItem(null);
  };
  const handleEdit = (item: ContactInfo) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      label: item.label,
      value: item.value,
      icon: item.icon,
      color: item.color,
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const data = editingItem ? { id: editingItem.id, ...formData } : formData;
    const success = await saveContactInfo(data);
    setFormLoading(false);
    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };
  const handleDelete = async (id: string) => {
    if (confirm('Bu iletişim bilgisini silmek istediğinizden emin misiniz?')) {
      await deleteContactInfo(id);
    }
  };
  const handleClose = () => {
    setIsModalOpen(false);
    resetForm();
  };
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
          <h1 className="text-2xl font-bold text-gray-900">İletişim Bilgileri</h1>
          <p className="text-gray-500 mt-1">Mağaza iletişim bilgilerini yönetin</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ekle
        </Button>
      </div>{' '}
      <Card>
        {loading ? (
          <Loading />
        ) : contactInfo.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Henüz iletişim bilgisi yok</div>
        ) : (
          <div className="space-y-4">
            {contactInfo.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg group"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: item.color }}
                >
                  {item.type === 'phone' && '📞'}
                  {item.type === 'email' && '📧'}
                  {item.type === 'whatsapp' && '💬'}
                  {item.type === 'address' && '📍'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.value}</p>
                </div>
                <Badge variant={item.is_active ? 'success' : 'default'} size="sm">
                  {item.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>{' '}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'İletişim Bilgisi Düzenle' : 'Yeni İletişim Bilgisi'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tip"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as ContactInfo['type'] })
              }
              options={typeOptions}
            />
            <Select
              label="İkon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              options={iconOptions}
            />
          </div>{' '}
          <Input
            label="Etiket"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="örn: Müşteri Hizmetleri"
            required
          />{' '}
          <Input
            label="Değer"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="örn: +90 555 123 4567"
            required
          />{' '}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
            <Input
              label="Sıra"
              type="number"
              value={formData.sort_order.toString()}
              onChange={(e) =>
                setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
              }
            />
          </div>{' '}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Aktif</span>
          </label>{' '}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" loading={formLoading}>
              {editingItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

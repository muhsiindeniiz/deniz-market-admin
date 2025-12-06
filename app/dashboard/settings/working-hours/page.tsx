'use client';
import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { WorkingHours } from '@/lib/types';
import { Plus, Edit, Trash2, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
export default function WorkingHoursPage() {
  const { workingHours, loading, saveWorkingHours, deleteWorkingHours } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkingHours | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    day_label: '',
    hours: '',
    sort_order: 0,
    is_active: true,
  });
  const resetForm = () => {
    setFormData({
      day_label: '',
      hours: '',
      sort_order: 0,
      is_active: true,
    });
    setEditingItem(null);
  };
  const handleEdit = (item: WorkingHours) => {
    setEditingItem(item);
    setFormData({
      day_label: item.day_label,
      hours: item.hours,
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const data = editingItem ? { id: editingItem.id, ...formData } : formData;
    const success = await saveWorkingHours(data);
    setFormLoading(false);
    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };
  const handleDelete = async (id: string) => {
    if (confirm('Bu çalışma saatini silmek istediğinizden emin misiniz?')) {
      await deleteWorkingHours(id);
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
          <h1 className="text-2xl font-bold text-gray-900">Çalışma Saatleri</h1>
          <p className="text-gray-500 mt-1">Mağaza çalışma saatlerini yönetin</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ekle
        </Button>
      </div>{' '}
      <Card>
        {loading ? (
          <Loading />
        ) : workingHours.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Henüz çalışma saati tanımlanmamış</div>
        ) : (
          <div className="space-y-3">
            {workingHours.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.day_label}</p>
                  <p className="text-sm text-gray-500">{item.hours}</p>
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
        title={editingItem ? 'Çalışma Saati Düzenle' : 'Yeni Çalışma Saati'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Gün"
            value={formData.day_label}
            onChange={(e) => setFormData({ ...formData, day_label: e.target.value })}
            placeholder="örn: Pazartesi - Cuma"
            required
          />{' '}
          <Input
            label="Saat"
            value={formData.hours}
            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
            placeholder="örn: 09:00 - 22:00"
            required
          />{' '}
          <Input
            label="Sıra"
            type="number"
            value={formData.sort_order.toString()}
            onChange={(e) =>
              setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
            }
          />{' '}
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

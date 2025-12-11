'use client';

import { useState } from 'react';
import { useWheelPrizes } from '@/hooks/useWheelPrizes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { WheelPrize, WheelPrizeType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash2, Gift, Percent, Truck, RotateCw, XCircle, AlertTriangle } from 'lucide-react';

const PRIZE_TYPES: { value: WheelPrizeType; label: string }[] = [
  { value: 'discount_fixed', label: 'Sabit İndirim (₺)' },
  { value: 'discount_percentage', label: 'Yüzde İndirim (%)' },
  { value: 'free_delivery', label: 'Ücretsiz Teslimat' },
  { value: 'bonus_spin', label: 'Bonus Çevirme Hakkı' },
  { value: 'no_prize', label: 'Ödül Yok' },
];

const PRIZE_TYPE_LABELS: Record<WheelPrizeType, string> = {
  discount_fixed: 'Sabit İndirim',
  discount_percentage: 'Yüzde İndirim',
  free_delivery: 'Ücretsiz Teslimat',
  bonus_spin: 'Bonus Çevirme',
  no_prize: 'Ödül Yok',
};

const PRIZE_TYPE_ICONS: Record<WheelPrizeType, React.ReactNode> = {
  discount_fixed: <Gift className="w-4 h-4" />,
  discount_percentage: <Percent className="w-4 h-4" />,
  free_delivery: <Truck className="w-4 h-4" />,
  bonus_spin: <RotateCw className="w-4 h-4" />,
  no_prize: <XCircle className="w-4 h-4" />,
};

const COMMON_ICONS = [
  'gift-outline',
  'percent-outline',
  'truck-outline',
  'refresh-outline',
  'close-circle-outline',
  'star-outline',
  'heart-outline',
  'flash-outline',
  'ribbon-outline',
  'trophy-outline',
];

export default function WheelPrizesPage() {
  const { prizes, loading, createPrize, updatePrize, deletePrize, getTotalProbability } =
    useWheelPrizes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<WheelPrize | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    prize_type: 'discount_fixed' as WheelPrizeType,
    prize_value: '',
    min_order_amount: '',
    probability: '',
    color: '#00AA55',
    icon: 'gift-outline',
    is_active: true,
    sort_order: '',
  });

  const totalProbability = getTotalProbability();

  const resetForm = () => {
    setFormData({
      label: '',
      prize_type: 'discount_fixed',
      prize_value: '',
      min_order_amount: '',
      probability: '',
      color: '#00AA55',
      icon: 'gift-outline',
      is_active: true,
      sort_order: '',
    });
    setEditingPrize(null);
  };

  const handleEdit = (prize: WheelPrize) => {
    setEditingPrize(prize);
    setFormData({
      label: prize.label,
      prize_type: prize.prize_type,
      prize_value: prize.prize_value.toString(),
      min_order_amount: prize.min_order_amount.toString(),
      probability: prize.probability.toString(),
      color: prize.color,
      icon: prize.icon,
      is_active: prize.is_active,
      sort_order: prize.sort_order.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const data = {
      label: formData.label,
      prize_type: formData.prize_type,
      prize_value: parseFloat(formData.prize_value) || 0,
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      probability: parseInt(formData.probability) || 10,
      color: formData.color,
      icon: formData.icon,
      is_active: formData.is_active,
      sort_order: parseInt(formData.sort_order) || 0,
    };

    let success;
    if (editingPrize) {
      success = await updatePrize(editingPrize.id, data);
    } else {
      success = await createPrize(data);
    }

    setFormLoading(false);
    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu ödülü silmek istediğinizden emin misiniz?')) {
      await deletePrize(id);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const getPrizeValueDisplay = (prize: WheelPrize) => {
    switch (prize.prize_type) {
      case 'discount_fixed':
        return formatCurrency(prize.prize_value);
      case 'discount_percentage':
        return `%${prize.prize_value}`;
      case 'free_delivery':
        return 'Ücretsiz';
      case 'bonus_spin':
        return '+1 Hak';
      case 'no_prize':
        return '-';
      default:
        return prize.prize_value;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Çark Ödülleri</h1>
          <p className="text-gray-500 mt-1">Şans çarkı ödüllerini yönetin</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Ödül
        </Button>
      </div>

      {/* Olasılık Uyarısı */}
      {totalProbability !== 100 && prizes.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3 p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Olasılık Toplamı Uyarısı</p>
              <p className="text-sm text-yellow-700">
                Aktif ödüllerin toplam olasılığı <strong>%{totalProbability}</strong> olarak
                ayarlanmış. Doğru çalışması için toplam %100 olmalıdır.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <Loading />
        ) : prizes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Henüz ödül tanımlanmamış</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sıra</TableHead>
                <TableHead>Ödül Adı</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Değer</TableHead>
                <TableHead>Min. Tutar</TableHead>
                <TableHead>Olasılık</TableHead>
                <TableHead>Renk</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prizes.map((prize) => (
                <TableRow key={prize.id}>
                  <TableCell className="font-medium">{prize.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded flex items-center justify-center text-white"
                        style={{ backgroundColor: prize.color }}
                      >
                        {PRIZE_TYPE_ICONS[prize.prize_type]}
                      </span>
                      <span className="font-medium">{prize.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">{PRIZE_TYPE_LABELS[prize.prize_type]}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {getPrizeValueDisplay(prize)}
                  </TableCell>
                  <TableCell>{formatCurrency(prize.min_order_amount)}</TableCell>
                  <TableCell>
                    <Badge variant={prize.probability >= 20 ? 'success' : 'default'}>
                      %{prize.probability}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: prize.color }}
                      />
                      <span className="text-xs font-mono text-gray-500">{prize.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={prize.is_active ? 'success' : 'default'}>
                      {prize.is_active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(prize)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(prize.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingPrize ? 'Ödül Düzenle' : 'Yeni Ödül'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Ödül Adı"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="₺20 İndirim"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Ödül Tipi"
              value={formData.prize_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  prize_type: e.target.value as WheelPrizeType,
                })
              }
              options={PRIZE_TYPES}
            />
            <Input
              label="Ödül Değeri"
              type="number"
              step="0.01"
              value={formData.prize_value}
              onChange={(e) => setFormData({ ...formData, prize_value: e.target.value })}
              placeholder={formData.prize_type === 'discount_percentage' ? '10' : '20'}
              helperText={
                formData.prize_type === 'discount_percentage'
                  ? 'Yüzde değeri girin (örn: 10)'
                  : formData.prize_type === 'discount_fixed'
                  ? 'TL cinsinden değer girin'
                  : 'Bu tip için değer gerekli değil'
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min. Sipariş Tutarı (₺)"
              type="number"
              step="0.01"
              value={formData.min_order_amount}
              onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
              placeholder="0"
              helperText="Bu ödülün geçerli olması için minimum sipariş tutarı"
            />
            <Input
              label="Olasılık (%)"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
              placeholder="10"
              helperText="Tüm aktif ödüllerin toplamı %100 olmalı"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#00AA55"
                  className="flex-1"
                />
              </div>
            </div>
            <Select
              label="İkon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              options={COMMON_ICONS.map((icon) => ({ value: icon, label: icon }))}
            />
          </div>

          <Input
            label="Sıralama"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
            placeholder="0"
            helperText="Çarktaki sıralama (küçükten büyüğe)"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Aktif</span>
          </label>

          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" loading={formLoading}>
              {editingPrize ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

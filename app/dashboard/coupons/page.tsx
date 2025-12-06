'use client';

import { useState } from 'react';
import { useCoupons } from '@/hooks/useCoupons';
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
import { Coupon } from '@/lib/types';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
export default function CouponsPage() {
  const { coupons, loading, createCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'fixed' as 'fixed' | 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
  });
  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'fixed',
      discount_value: '',
      min_order_amount: '',
      max_uses: '',
      valid_from: '',
      valid_until: '',
      is_active: true,
    });
    setEditingCoupon(null);
  };
  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount.toString(),
      max_uses: coupon.max_uses?.toString() || '',
      valid_from: coupon.valid_from?.split('T')[0] || '',
      valid_until: coupon.valid_until?.split('T')[0] || '',
      is_active: coupon.is_active,
    });
    setIsModalOpen(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const data = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      valid_from: formData.valid_from || new Date().toISOString(),
      valid_until: formData.valid_until || null,
      is_active: formData.is_active,
    };
    let success;
    if (editingCoupon) {
      success = await updateCoupon(editingCoupon.id, data);
    } else {
      success = await createCoupon(data);
    }
    setFormLoading(false);
    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };
  const handleDelete = async (id: string) => {
    if (confirm('Bu kuponu silmek istediğinizden emin misiniz?')) {
      await deleteCoupon(id);
    }
  };
  const handleClose = () => {
    setIsModalOpen(false);
    resetForm();
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kuponlar</h1>
          <p className="text-gray-500 mt-1">İndirim kuponlarını yönetin</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kupon
        </Button>
      </div>{' '}
      <Card>
        {loading ? (
          <Loading />
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Henüz kupon yok</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kod</TableHead>
                <TableHead>İndirim</TableHead>
                <TableHead>Min. Tutar</TableHead>
                <TableHead>Kullanım</TableHead>
                <TableHead>Geçerlilik</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-green-600">{coupon.code}</span>
                  </TableCell>
                  <TableCell>
                    {coupon.discount_type === 'percentage'
                      ? `%${coupon.discount_value}`
                      : formatCurrency(coupon.discount_value)}
                  </TableCell>
                  <TableCell>{formatCurrency(coupon.min_order_amount)}</TableCell>
                  <TableCell>
                    {coupon.current_uses} / {coupon.max_uses || '∞'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {coupon.valid_until
                      ? `${formatDateShort(coupon.valid_from)} - ${formatDateShort(coupon.valid_until)}`
                      : `${formatDateShort(coupon.valid_from)} - Süresiz`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.is_active ? 'success' : 'default'}>
                      {coupon.is_active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(coupon)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(coupon.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>{' '}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingCoupon ? 'Kupon Düzenle' : 'Yeni Kupon'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Kupon Kodu"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="INDIRIM20"
            required
          />{' '}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="İndirim Tipi"
              value={formData.discount_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount_type: e.target.value as 'fixed' | 'percentage',
                })
              }
              options={[
                { value: 'fixed', label: 'Sabit Tutar (₺)' },
                { value: 'percentage', label: 'Yüzde (%)' },
              ]}
            />
            <Input
              label="İndirim Değeri"
              type="number"
              step="0.01"
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              required
            />
          </div>{' '}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min. Sipariş Tutarı (₺)"
              type="number"
              step="0.01"
              value={formData.min_order_amount}
              onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
            />
            <Input
              label="Max. Kullanım"
              type="number"
              value={formData.max_uses}
              onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
              placeholder="Boş = Sınırsız"
            />
          </div>{' '}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Başlangıç Tarihi"
              type="date"
              value={formData.valid_from}
              onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
            />
            <Input
              label="Bitiş Tarihi"
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
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
              {editingCoupon ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

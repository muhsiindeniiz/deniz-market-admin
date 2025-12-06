'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { OrderList } from '@/components/orders/OrderList';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { OrderStatus } from '@/lib/types';
import {
  Search,
  X,
  Trash2,
  Clock,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

const statusOptions = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'pending', label: 'Sipariş Alındı' },
  { value: 'processing', label: 'İşleniyor' },
  { value: 'preparing', label: 'Hazırlanıyor' },
  { value: 'on_delivery', label: 'Yolda' },
  { value: 'delivered', label: 'Teslim Edildi' },
  { value: 'cancelled', label: 'İptal Edildi' },
];

const bulkStatusOptions: { value: OrderStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'pending', label: 'Sipariş Alındı', icon: Clock, color: 'text-yellow-600' },
  { value: 'processing', label: 'İşleniyor', icon: Loader2, color: 'text-blue-600' },
  { value: 'preparing', label: 'Hazırlanıyor', icon: Package, color: 'text-purple-600' },
  { value: 'on_delivery', label: 'Yolda', icon: Truck, color: 'text-orange-600' },
  { value: 'delivered', label: 'Teslim Edildi', icon: CheckCircle, color: 'text-green-600' },
  { value: 'cancelled', label: 'İptal Edildi', icon: XCircle, color: 'text-red-600' },
];

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { orders, loading, totalPages, bulkUpdateStatus, bulkDeleteOrders } = useOrders({
    search,
    status: status || undefined,
    page,
  });

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkStatusUpdate = async (newStatus: OrderStatus) => {
    setIsProcessing(true);
    const success = await bulkUpdateStatus(selectedIds, newStatus);
    setIsProcessing(false);
    if (success) {
      setSelectedIds([]);
      setBulkStatusModalOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    const success = await bulkDeleteOrders(selectedIds);
    setIsProcessing(false);
    if (success) {
      setSelectedIds([]);
      setBulkDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
        <p className="text-gray-500 mt-1">Tüm siparişleri görüntüleyin ve yönetin</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Sipariş numarası ara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as OrderStatus | '');
                setPage(1);
              }}
              options={statusOptions}
            />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-sm font-medium text-green-800">
              {selectedIds.length} sipariş seçildi
            </span>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkStatusModalOpen(true)}
              disabled={isProcessing}
            >
              <Clock className="w-4 h-4 mr-1" />
              Durum Değiştir
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setBulkDeleteModalOpen(true)}
              disabled={isProcessing}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Sil
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {loading ? (
          <Loading />
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Sipariş bulunamadı</div>
        ) : (
          <>
            <OrderList
              orders={orders}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
            />
            <div className="mt-6">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>

      {/* Bulk Status Update Modal */}
      <Modal
        isOpen={bulkStatusModalOpen}
        onClose={() => setBulkStatusModalOpen(false)}
        title="Toplu Durum Değiştir"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {selectedIds.length} siparişin durumunu değiştireceksiniz. Yeni durumu seçin:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {bulkStatusOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleBulkStatusUpdate(option.value)}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Icon className={`w-5 h-5 ${option.color}`} />
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setBulkStatusModalOpen(false)}>
              İptal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title="Siparişleri Sil"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-sm text-red-700 font-medium">
                {selectedIds.length} sipariş silinecek.
              </p>
              <p className="text-sm text-red-600 mt-1">
                Bu işlem geri alınamaz. Sipariş detayları ve ürünler de silinecektir.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>
              İptal
            </Button>
            <Button variant="danger" onClick={handleBulkDelete} disabled={isProcessing}>
              {isProcessing ? 'Siliniyor...' : 'Sil'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

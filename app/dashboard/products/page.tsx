'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { ProductList } from '@/components/products/ProductList';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import {
  Plus,
  Search,
  Trash2,
  Star,
  StarOff,
  Tag,
  Package,
  X,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStockModalOpen, setBulkStockModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkStock, setBulkStock] = useState<number | string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    products,
    categories,
    loading,
    totalPages,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateStock,
    bulkToggleFeatured,
    bulkToggleOnSale,
  } = useProducts({
    search,
    categoryId: categoryId || undefined,
    page,
  });

  const categoryOptions = [
    { value: '', label: 'Tüm Kategoriler' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  const handleDelete = async (id: string, images: string[]) => {
    await deleteProduct(id, images);
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    const success = await bulkDeleteProducts(selectedIds);
    setIsProcessing(false);
    if (success) {
      setSelectedIds([]);
      setBulkDeleteModalOpen(false);
    }
  };

  const handleBulkStock = async () => {
    setIsProcessing(true);
    const stockValue = typeof bulkStock === 'string' ? parseInt(bulkStock) || 0 : bulkStock;
    const success = await bulkUpdateStock(selectedIds, stockValue);
    setIsProcessing(false);
    if (success) {
      setSelectedIds([]);
      setBulkStockModalOpen(false);
      setBulkStock('');
    }
  };

  const handleOpenStockModal = () => {
    if (selectedIds.length === 1) {
      const selectedProduct = products.find((p) => p.id === selectedIds[0]);
      if (selectedProduct) {
        setBulkStock(selectedProduct.stock);
      }
    } else {
      setBulkStock('');
    }
    setBulkStockModalOpen(true);
  };

  const handleBulkFeatured = async (isFeatured: boolean) => {
    setIsProcessing(true);
    const success = await bulkToggleFeatured(selectedIds, isFeatured);
    setIsProcessing(false);
    if (success) {
      setSelectedIds([]);
    }
  };

  const handleBulkOnSale = async (isOnSale: boolean) => {
    setIsProcessing(true);
    const success = await bulkToggleOnSale(selectedIds, isOnSale);
    setIsProcessing(false);
    if (success) {
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-gray-500 mt-1">Tüm ürünleri görüntüleyin ve yönetin</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ürün
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Ürün adı ara..."
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
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              options={categoryOptions}
            />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-sm font-medium text-green-800">
              {selectedIds.length} ürün seçildi
            </span>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenStockModal}
              disabled={isProcessing}
            >
              <Package className="w-4 h-4 mr-1" />
              Stok Güncelle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkFeatured(true)}
              disabled={isProcessing}
            >
              <Star className="w-4 h-4 mr-1" />
              Öne Çıkar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkFeatured(false)}
              disabled={isProcessing}
            >
              <StarOff className="w-4 h-4 mr-1" />
              Öne Çıkarma
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkOnSale(true)}
              disabled={isProcessing}
            >
              <Tag className="w-4 h-4 mr-1" />
              İndirme Al
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkOnSale(false)}
              disabled={isProcessing}
            >
              <XCircle className="w-4 h-4 mr-1" />
              İndirimden Çıkar
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
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Ürün bulunamadı</div>
        ) : (
          <>
            <ProductList
              products={products}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onDelete={handleDelete}
            />
            <div className="mt-6">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>

      {/* Bulk Stock Update Modal */}
      <Modal
        isOpen={bulkStockModalOpen}
        onClose={() => setBulkStockModalOpen(false)}
        title={selectedIds.length === 1 ? 'Stok Güncelle' : 'Toplu Stok Güncelle'}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {selectedIds.length === 1
              ? `"${products.find((p) => p.id === selectedIds[0])?.name}" ürününün stoğunu güncelleyeceksiniz.`
              : `${selectedIds.length} ürünün stoğunu güncelleyeceksiniz.`}
          </p>
          <Input
            type="number"
            label="Yeni Stok Miktarı"
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
            min={0}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBulkStockModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleBulkStock} disabled={isProcessing}>
              {isProcessing ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title="Ürünleri Sil"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-sm text-red-700 font-medium">
                {selectedIds.length} ürün silinecek.
              </p>
              <p className="text-sm text-red-600 mt-1">
                Bu işlem geri alınamaz ve ürün resimleri de silinecektir.
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

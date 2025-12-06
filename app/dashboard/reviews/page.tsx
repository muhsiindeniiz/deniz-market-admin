'use client';

import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { Loading } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { StackedProductImages } from '@/components/ui/StackedProductImages';
import { OrderProductsModal } from '@/components/ui/OrderProductsModal';
import { formatDate } from '@/lib/utils';
import { Review } from '@/lib/types';
import {
  Star,
  Trash2,
  Package,
  User,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  Filter,
} from 'lucide-react';

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [minRating, setMinRating] = useState<number | undefined>();
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [orderProductsModalOpen, setOrderProductsModalOpen] = useState(false);
  const [selectedReviewForProducts, setSelectedReviewForProducts] = useState<Review | null>(null);

  const { reviews, totalCount, loading, stats, pageSize, deleteReview, deleteMultipleReviews, refetch } =
    useReviews({ page, minRating });

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(reviews.map((r) => r.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectReview = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews([...selectedReviews, id]);
    } else {
      setSelectedReviews(selectedReviews.filter((r) => r !== id));
    }
  };

  const handleDeleteClick = (id: string) => {
    setReviewToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (reviewToDelete) {
      await deleteReview(reviewToDelete);
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    await deleteMultipleReviews(selectedReviews);
    setSelectedReviews([]);
    setBulkDeleteModalOpen(false);
  };

  const handleOpenOrderProducts = (review: Review) => {
    setSelectedReviewForProducts(review);
    setOrderProductsModalOpen(true);
  };

  const getOrderProducts = (review: Review) => {
    if (!review.order?.items) return [];
    return review.order.items
      .filter((item) => item.product)
      .map((item) => ({
        id: item.product!.id,
        name: item.product!.name,
        images: item.product!.images ?? [],
      }));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return <Loading size="lg" text="Değerlendirmeler yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Değerlendirmeler</h1>
          <p className="text-gray-500 mt-1">Müşteri değerlendirmelerini yönetin</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>

          {selectedReviews.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setBulkDeleteModalOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {selectedReviews.length} Seçili Sil
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Değerlendirme</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalReviews}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ortalama Puan</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </p>
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 col-span-1 md:col-span-2">
          <p className="text-sm font-medium text-gray-500 mb-3">Puan Dağılımı</p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrele:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Min. Puan:</span>
            <select
              value={minRating || ''}
              onChange={(e) => {
                setMinRating(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tümü</option>
              <option value="5">5 Yıldız</option>
              <option value="4">4+ Yıldız</option>
              <option value="3">3+ Yıldız</option>
              <option value="2">2+ Yıldız</option>
              <option value="1">1+ Yıldız</option>
            </select>
          </div>

          {minRating && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMinRating(undefined);
                setPage(1);
              }}
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>
      </Card>

      {/* Reviews List */}
      <Card>
        {reviews.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Henüz değerlendirme bulunmuyor</p>
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
                          selectedReviews.length === reviews.length && reviews.length > 0
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sipariş
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yorum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedReviews.includes(review.id)}
                          onChange={(e) =>
                            handleSelectReview(review.id, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        {review.order?.items && review.order.items.length > 0 ? (
                          <StackedProductImages
                            products={getOrderProducts(review)}
                            maxVisible={3}
                            onClick={() => handleOpenOrderProducts(review)}
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            {review.product?.images?.[0] ? (
                              <img
                                src={review.product.images[0]}
                                alt={review.product?.name || 'Ürün'}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {review.product?.name || 'Bilinmeyen Ürün'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {review.user?.full_name || 'Anonim'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {review.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{renderStars(review.rating)}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {review.comment || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(review.id)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Değerlendirmeyi Sil"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <p className="text-sm text-red-700">
              Bu işlem geri alınamaz. Değerlendirme kalıcı olarak silinecektir.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              İptal
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
              {selectedReviews.length} değerlendirme kalıcı olarak silinecektir. Bu işlem
              geri alınamaz.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>
              İptal
            </Button>
            <Button variant="danger" onClick={handleBulkDelete}>
              {selectedReviews.length} Değerlendirmeyi Sil
            </Button>
          </div>
        </div>
      </Modal>

      {/* Order Products Modal */}
      <OrderProductsModal
        isOpen={orderProductsModalOpen}
        onClose={() => {
          setOrderProductsModalOpen(false);
          setSelectedReviewForProducts(null);
        }}
        orderNumber={selectedReviewForProducts?.order?.order_number}
        products={selectedReviewForProducts?.order?.items || []}
      />
    </div>
  );
}

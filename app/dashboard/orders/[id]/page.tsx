'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Loading } from '@/components/ui/Loading';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { ArrowLeft, MapPin, Phone, User, Package } from 'lucide-react';
const statusOptions = [
  { value: 'pending', label: 'Sipariş Alındı' },
  { value: 'processing', label: 'Hazırlanıyor' },
  { value: 'preparing', label: 'Paketleniyor' },
  { value: 'on_delivery', label: 'Yolda' },
  { value: 'delivered', label: 'Teslim Edildi' },
  { value: 'cancelled', label: 'İptal Edildi' },
];
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrder, updateOrderStatus } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    const fetchOrder = async () => {
      if (params.id) {
        const data = await getOrder(params.id as string);
        setOrder(data);
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id, getOrder]);
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    await updateOrderStatus(order.id, newStatus);
    setOrder({ ...order, status: newStatus });
    setUpdating(false);
  };
  if (loading) {
    return <Loading size="lg" text="Sipariş yükleniyor..." />;
  }
  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sipariş bulunamadı</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Geri Dön
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
          <p className="text-gray-500">{formatDate(order.created_at)}</p>
        </div>
        <div className="ml-auto">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>{' '}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sipariş Ürünleri */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Ürünleri</h3>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.product?.name || 'Silinmiş Ürün'}
                    </p>
                    <p className="text-sm text-gray-500">{item.quantity} adet</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency((item.discount_price || item.price) * item.quantity)}
                    </p>
                    {item.discount_price && (
                      <p className="text-sm text-gray-400 line-through">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>{' '}
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ara Toplam</span>
                <span>
                  {formatCurrency(order.total_amount - order.delivery_fee + order.discount_amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Teslimat Ücreti</span>
                <span>{formatCurrency(order.delivery_fee)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>İndirim</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Toplam</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </Card>{' '}
          {/* Teslimat Notu */}
          {order.delivery_note && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Teslimat Notu</h3>
              <p className="text-gray-600">{order.delivery_note}</p>
            </Card>
          )}
        </div>{' '}
        <div className="space-y-6">
          {/* Durum Güncelleme */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Durumu</h3>
            <Select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              options={statusOptions}
              disabled={updating}
            />
          </Card>{' '}
          {/* Müşteri Bilgileri */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{order.user?.full_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{order.user?.phone || '-'}</span>
              </div>
            </div>
          </Card>{' '}
          {/* Teslimat Adresi */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Teslimat Adresi</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{order.delivery_address?.title}</p>
                <p className="text-gray-600 mt-1">{order.delivery_address?.full_address}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {order.delivery_address?.district}, {order.delivery_address?.city}
                </p>
              </div>
            </div>
          </Card>{' '}
          {/* Ödeme Bilgileri */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme</h3>
            <Badge>{PAYMENT_METHOD_LABELS[order.payment_method]}</Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Modal } from './Modal';
import { Package } from 'lucide-react';

interface OrderProduct {
  id: string;
  product_id: string | null;
  quantity: number;
  product?: {
    id: string;
    name: string;
    images: string[];
  } | null;
}

interface OrderProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  products: OrderProduct[];
}

export function OrderProductsModal({
  isOpen,
  onClose,
  orderNumber,
  products,
}: OrderProductsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={orderNumber ? `Sipariş #${orderNumber} Ürünleri` : 'Sipariş Ürünleri'}
      size="md"
    >
      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Bu siparişte ürün bulunamadı</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-3">
                {item.product?.images?.[0] ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product?.name || 'Ürün'}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.product?.name || 'Bilinmeyen Ürün'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Adet: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

'use client';

import Link from 'next/link';
import { Order } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface RecentOrdersProps {
  orders: Order[];
}

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  processing: 'info',
  preparing: 'info',
  on_delivery: 'warning',
  delivered: 'success',
  cancelled: 'danger',
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card padding="none">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Son Siparişler</h3>
        <Link
          href="/dashboard/orders"
          className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          Tümünü Gör <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="divide-y divide-gray-100">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/dashboard/orders/${order.id}`}
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900">{order.order_number}</p>
              <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{formatCurrency(order.total_amount)}</p>
              <Badge variant={statusVariants[order.status]} size="sm">
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
          </Link>
        ))}
        {orders.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">Henüz sipariş yok</div>
        )}
      </div>
    </Card>
  );
}

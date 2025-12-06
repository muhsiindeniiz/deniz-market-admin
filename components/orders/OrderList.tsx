'use client';

import Link from 'next/link';
import { Order } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface OrderListProps {
  orders: Order[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
}

export function OrderList({ orders, selectedIds, onSelect, onSelectAll }: OrderListProps) {
  const allSelected = orders.length > 0 && selectedIds.length === orders.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < orders.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </TableHead>
          <TableHead>Sipariş No</TableHead>
          <TableHead>Müşteri</TableHead>
          <TableHead>Tarih</TableHead>
          <TableHead>Tutar</TableHead>
          <TableHead>Ödeme</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead className="text-right">İşlem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className={selectedIds.includes(order.id) ? 'bg-green-50' : ''}
          >
            <TableCell>
              <input
                type="checkbox"
                checked={selectedIds.includes(order.id)}
                onChange={() => onSelect(order.id)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </TableCell>
            <TableCell>
              <span className="font-medium">{order.order_number}</span>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium text-gray-900">{order.user?.full_name || '-'}</p>
                <p className="text-sm text-gray-500">{order.user?.phone || '-'}</p>
              </div>
            </TableCell>
            <TableCell className="text-gray-500">{formatDate(order.created_at)}</TableCell>
            <TableCell>
              <span className="font-medium">{formatCurrency(order.total_amount)}</span>
            </TableCell>
            <TableCell>{PAYMENT_METHOD_LABELS[order.payment_method]}</TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/dashboard/orders/${order.id}`}>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

import { Badge } from '@/components/ui/Badge';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { OrderStatus } from '@/lib/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusVariants: Record<OrderStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  processing: 'info',
  preparing: 'info',
  on_delivery: 'warning',
  delivered: 'success',
  cancelled: 'danger',
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge variant={statusVariants[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

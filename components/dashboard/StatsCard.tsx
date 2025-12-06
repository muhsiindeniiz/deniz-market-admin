import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}
export function StatsCard({ title, value, icon: Icon, trend, color = 'green' }: StatsCardProps) {
  const colors = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={cn('text-sm mt-1', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}

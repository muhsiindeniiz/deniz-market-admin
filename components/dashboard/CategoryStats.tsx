'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';
import { CategoryStat } from '@/lib/types';

interface CategoryStatsProps {
  data: CategoryStat[];
}

export function CategoryStats({ data }: CategoryStatsProps) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4">Kategoriye Göre Siparişler</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="category_name" type="category" tick={{ fontSize: 12 }} width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="order_count" name="Sipariş Sayısı" fill="#00AA55" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

import { TopProduct } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Package } from 'lucide-react';

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <Card padding="none">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">En Çok Satan Ürünler</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {products.map((product, index) => (
          <div key={product.product_id} className="flex items-center gap-4 px-6 py-4">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
              {index + 1}
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{product.product_name}</p>
              <p className="text-sm text-gray-500">{product.total_sold} adet satıldı</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{formatCurrency(product.total_revenue)}</p>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">Henüz satış yok</div>
        )}
      </div>
    </Card>
  );
}

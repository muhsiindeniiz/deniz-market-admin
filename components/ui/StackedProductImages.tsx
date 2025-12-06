'use client';

import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImage {
  id: string;
  name: string;
  images: string[];
}

interface StackedProductImagesProps {
  products: ProductImage[];
  maxVisible?: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function StackedProductImages({
  products,
  maxVisible = 3,
  onClick,
  size = 'md',
}: StackedProductImagesProps) {
  const visibleProducts = products.slice(0, maxVisible);
  const remainingCount = products.length - maxVisible;

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const offsets = {
    sm: '-ml-3',
    md: '-ml-4',
    lg: '-ml-5',
  };

  if (products.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg bg-gray-100 flex items-center justify-center',
          sizes[size]
        )}
      >
        <Package className="w-5 h-5 text-gray-400" />
      </div>
    );
  }

  if (products.length === 1) {
    const product = products[0];
    return (
      <div className="flex items-center gap-3">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className={cn('rounded-lg object-cover', sizes[size])}
          />
        ) : (
          <div
            className={cn(
              'rounded-lg bg-gray-100 flex items-center justify-center',
              sizes[size]
            )}
          >
            <Package className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
          {product.name}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 group cursor-pointer"
      type="button"
    >
      <div className="flex items-center">
        {visibleProducts.map((product, index) => (
          <div
            key={product.id}
            className={cn(
              'relative rounded-lg border-2 border-white shadow-sm transition-transform group-hover:scale-105',
              sizes[size],
              index > 0 && offsets[size]
            )}
            style={{ zIndex: maxVisible - index }}
          >
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              'relative rounded-lg border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center',
              sizes[size],
              offsets[size]
            )}
            style={{ zIndex: 0 }}
          >
            <span className="text-xs font-medium text-gray-600">
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
      <span className="text-sm text-green-600 font-medium group-hover:underline">
        {products.length} ürün
      </span>
    </button>
  );
}

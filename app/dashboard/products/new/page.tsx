'use client';

import { useProducts } from '@/hooks/useProducts';
import { ProductForm } from '@/components/products/ProductForm';
import { Loading } from '@/components/ui/Loading';
import { Product } from '@/lib/types';

export default function NewProductPage() {
  const { categories, loading, createProduct } = useProducts();

  const handleSubmit = async (
    data: Partial<Product>,
    newImages: File[],
    removedImages: string[]
  ) => {
    return await createProduct(data, newImages);
  };

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün</h1>
        <p className="text-gray-500 mt-1">Yeni bir ürün ekleyin</p>
      </div>

      <ProductForm categories={categories} onSubmit={handleSubmit} />
    </div>
  );
}

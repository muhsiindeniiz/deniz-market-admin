'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { ProductForm } from '@/components/products/ProductForm';
import { Loading } from '@/components/ui/Loading';
import { Product } from '@/lib/types';

export default function EditProductPage() {
  const params = useParams();
  const { categories, getProduct, updateProduct, loading: categoriesLoading } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (params.id && !hasFetched.current) {
        hasFetched.current = true;
        const data = await getProduct(params.id as string);
        setProduct(data);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const handleSubmit = async (
    data: Partial<Product>,
    newImages: File[],
    removedImages: string[]
  ) => {
    if (!product) return false;
    return await updateProduct(product.id, data, newImages, removedImages);
  };

  if (loading || categoriesLoading) {
    return <Loading size="lg" text="Ürün yükleniyor..." />;
  }

  if (!product) {
    return <div className="text-center py-12 text-gray-500">Ürün bulunamadı</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ürün Düzenle</h1>
        <p className="text-gray-500 mt-1">{product.name}</p>
      </div>

      <ProductForm product={product} categories={categories} onSubmit={handleSubmit} />
    </div>
  );
}

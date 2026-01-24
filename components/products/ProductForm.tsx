'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category, Store } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  stores?: Store[];
  onSubmit: (
    data: Partial<Product>,
    newImages: File[],
    removedImages: string[]
  ) => Promise<boolean>;
}

export function ProductForm({ product, categories, stores = [], onSubmit }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    vat_rate: '18',
    category_id: '',
    store_id: '',
    stock: '',
    unit: 'adet',
    weight: '',
    is_featured: false,
    is_on_sale: false,
    images: [] as string[],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        discount_price: product.discount_price?.toString() || '',
        vat_rate: product.vat_rate?.toString() || '18',
        category_id: product.category_id || '',
        store_id: product.store_id || '',
        stock: product.stock.toString(),
        unit: product.unit,
        weight: product.weight || '',
        is_featured: product.is_featured,
        is_on_sale: product.is_on_sale,
        images: product.images || [],
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data: Partial<Product> = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      vat_rate: parseFloat(formData.vat_rate) || 18,
      category_id: formData.category_id || null,
      store_id: formData.store_id || null,
      stock: parseInt(formData.stock) || 0,
      unit: formData.unit,
      weight: formData.weight || null,
      is_featured: formData.is_featured,
      is_on_sale: formData.is_on_sale,
      images: formData.images,
    };

    const success = await onSubmit(data, newImages, removedImages);
    setLoading(false);

    if (success) {
      router.push('/dashboard/products');
    }
  };

  const handleImageChange = (files: File[], removed?: string[]) => {
    setNewImages(files);
    if (removed) {
      setRemovedImages(removed);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const storeOptions = stores.map((store) => ({
    value: store.id,
    label: store.name,
  }));

  const unitOptions = [
    { value: 'adet', label: 'Adet' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'lt', label: 'Litre' },
    { value: 'paket', label: 'Paket' },
  ];

  const vatRateOptions = [
    { value: '0', label: '%0 (KDV\'siz)' },
    { value: '1', label: '%1' },
    { value: '8', label: '%8' },
    { value: '10', label: '%10' },
    { value: '18', label: '%18' },
    { value: '20', label: '%20' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürün Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Ürün Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Select
            label="Kategori"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            options={categoryOptions}
            placeholder="Kategori seçin"
          />
          <Input
            label="Fiyat (₺)"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <Input
            label="İndirimli Fiyat (₺)"
            type="number"
            step="0.01"
            value={formData.discount_price}
            onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
          />
          <Select
            label="KDV Oranı"
            value={formData.vat_rate}
            onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
            options={vatRateOptions}
          />
          <Input
            label="Stok"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
          />
          <Select
            label="Birim"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            options={unitOptions}
          />
          <Input
            label="Ağırlık/Boyut"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder="örn: 500g, 1L"
          />
          {stores.length > 0 && (
            <Select
              label="Mağaza"
              value={formData.store_id}
              onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
              options={storeOptions}
              placeholder="Mağaza seçin"
            />
          )}
        </div>{' '}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>{' '}
        <div className="mt-6 flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Öne Çıkan Ürün</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_on_sale}
              onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">İndirimde</span>
          </label>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürün Görselleri</h3>
        <ImageUpload value={formData.images} onChange={handleImageChange} multiple maxFiles={5} />
      </Card>
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
        <Button type="submit" loading={loading}>
          {product ? 'Güncelle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  );
}

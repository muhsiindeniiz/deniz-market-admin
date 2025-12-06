'use client';

import { useState, useEffect } from 'react';
import { usePromos } from '@/hooks/usePromos';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { PromoList } from '@/components/promos/PromoList';
import { PromoForm } from '@/components/promos/PromoForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { Promo, Store } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { Plus } from 'lucide-react';

export default function PromosPage() {
  const { promos, loading, createPromo, updatePromo, deletePromo, updateSortOrder } = usePromos();
  const { categories } = useCategories();
  const { products } = useProducts();
  const [stores, setStores] = useState<Store[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase.from('stores').select('*').eq('is_active', true);
      setStores(data || []);
    };
    fetchStores();
  }, []);

  const handleEdit = (promo: Promo) => {
    setEditingPromo(promo);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Partial<Promo>, imageFile?: File) => {
    if (editingPromo) {
      return await updatePromo(editingPromo.id, data, imageFile);
    }
    if (!imageFile) return false;
    return await createPromo(data, imageFile);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
  };

  const handleReorder = async (items: { id: string; sort_order: number }[]) => {
    await updateSortOrder(items);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kampanyalar</h1>
          <p className="text-gray-500 mt-1">
            Promosyon ve kampanyaları yönetin. Sıralamayı değiştirmek için sürükleyin.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kampanya
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : promos.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">Henüz kampanya yok</div>
        </Card>
      ) : (
        <PromoList
          promos={promos}
          onEdit={handleEdit}
          onDelete={deletePromo}
          onReorder={handleReorder}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingPromo ? 'Kampanya Düzenle' : 'Yeni Kampanya'}
        size="lg"
      >
        <PromoForm
          promo={editingPromo}
          categories={categories}
          products={products}
          stores={stores}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
}
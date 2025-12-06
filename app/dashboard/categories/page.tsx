'use client';

import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { CategoryList } from '@/components/categories/CategoryList';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { Category } from '@/lib/types';
import { Plus } from 'lucide-react';

export default function CategoriesPage() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Partial<Category>, imageFile?: File, removeImage?: boolean) => {
    if (editingCategory) {
      return await updateCategory(editingCategory.id, data, imageFile, removeImage);
    }
    return await createCategory(data, imageFile);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
          <p className="text-gray-500 mt-1">Ürün kategorilerini yönetin</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : categories.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">Henüz kategori yok</div>
        </Card>
      ) : (
        <CategoryList categories={categories} onEdit={handleEdit} onDelete={deleteCategory} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
      >
        <CategoryForm category={editingCategory} onSubmit={handleSubmit} onCancel={handleClose} />
      </Modal>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { FAQCategory, FAQItem } from '@/lib/types';
import { Plus, Edit, Trash2, ArrowLeft, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const { faqCategories, loading, saveFAQCategory, deleteFAQCategory, saveFAQItem, deleteFAQItem } =
    useSettings();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [formLoading, setFormLoading] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    sort_order: 0,
    is_active: true,
  });

  const [itemForm, setItemForm] = useState({
    category_id: '',
    question: '',
    answer: '',
    sort_order: 0,
    is_active: true,
  });

  const toggleCategory = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const handleEditCategory = (category: FAQCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
    setIsCategoryModalOpen(true);
  };

  const handleEditItem = (item: FAQItem) => {
    setEditingItem(item);
    setItemForm({
      category_id: item.category_id,
      question: item.question,
      answer: item.answer,
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    setIsItemModalOpen(true);
  };

  const handleAddItem = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setItemForm({
      category_id: categoryId,
      question: '',
      answer: '',
      sort_order: 0,
      is_active: true,
    });
    setIsItemModalOpen(true);
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const data = editingCategory ? { id: editingCategory.id, ...categoryForm } : categoryForm;
    const success = await saveFAQCategory(data);

    setFormLoading(false);
    if (success) {
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', sort_order: 0, is_active: true });
    }
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const data = editingItem ? { id: editingItem.id, ...itemForm } : itemForm;
    const success = await saveFAQItem(data);

    setFormLoading(false);
    if (success) {
      setIsItemModalOpen(false);
      setEditingItem(null);
      setItemForm({
        category_id: '',
        question: '',
        answer: '',
        sort_order: 0,
        is_active: true,
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Bu kategoriyi ve tüm sorularını silmek istediğinizden emin misiniz?')) {
      await deleteFAQCategory(id);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      await deleteFAQItem(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Sıkça Sorulan Sorular</h1>
          <p className="text-gray-500 mt-1">SSS kategorileri ve soruları yönetin</p>
        </div>
        <Button onClick={() => setIsCategoryModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : faqCategories.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">Henüz SSS kategorisi yok</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {faqCategories.map((category) => (
            <Card key={category.id} padding="none">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCategory(category.id)}
              >
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <HelpCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-500">{category.items?.length || 0} soru</p>
                </div>
                <Badge variant={category.is_active ? 'success' : 'default'} size="sm">
                  {category.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => handleAddItem(category.id)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {expandedCategories.has(category.id) && category.items && (
                <div className="border-t border-gray-100">
                  {category.items.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Bu kategoride soru yok
                    </div>
                  ) : (
                    category.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 group"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.question}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.answer}</p>
                        </div>
                        <Badge variant={item.is_active ? 'success' : 'default'} size="sm">
                          {item.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Kategori Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
          setCategoryForm({ name: '', sort_order: 0, is_active: true });
        }}
        title={editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
      >
        <form onSubmit={handleSubmitCategory} className="space-y-6">
          <Input
            label="Kategori Adı"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            required
          />

          <Input
            label="Sıra"
            type="number"
            value={categoryForm.sort_order.toString()}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value) || 0 })
            }
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={categoryForm.is_active}
              onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Aktif</span>
          </label>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCategoryModalOpen(false);
                setEditingCategory(null);
              }}
            >
              İptal
            </Button>
            <Button type="submit" loading={formLoading}>
              {editingCategory ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soru Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Soru Düzenle' : 'Yeni Soru'}
        size="lg"
      >
        <form onSubmit={handleSubmitItem} className="space-y-6">
          <Select
            label="Kategori"
            value={itemForm.category_id}
            onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
            options={faqCategories.map((c) => ({ value: c.id, label: c.name }))}
            required
          />

          <Input
            label="Soru"
            value={itemForm.question}
            onChange={(e) => setItemForm({ ...itemForm, question: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cevap</label>
            <textarea
              value={itemForm.answer}
              onChange={(e) => setItemForm({ ...itemForm, answer: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <Input
            label="Sıra"
            type="number"
            value={itemForm.sort_order.toString()}
            onChange={(e) =>
              setItemForm({ ...itemForm, sort_order: parseInt(e.target.value) || 0 })
            }
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={itemForm.is_active}
              onChange={(e) => setItemForm({ ...itemForm, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Aktif</span>
          </label>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsItemModalOpen(false);
                setEditingItem(null);
              }}
            >
              İptal
            </Button>
            <Button type="submit" loading={formLoading}>
              {editingItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

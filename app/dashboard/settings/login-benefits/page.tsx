'use client';

import { useState } from 'react';
import { useLoginBenefits } from '@/hooks/useLoginBenefits';
import { LoginBenefit } from '@/lib/types';
import { Loading } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  RefreshCw,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react';
import { IconRenderer } from '@/components/ui/IconRenderer';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableBenefitItemProps {
  benefit: LoginBenefit;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

function SortableBenefitItem({ benefit, onEdit, onDelete, onToggle }: SortableBenefitItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: benefit.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg ${
        !benefit.is_active ? 'opacity-60' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </button>

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: benefit.color + '20' }}
      >
        <IconRenderer icon={benefit.icon} size={24} color={benefit.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{benefit.title}</h3>
          <span
            className="px-2 py-0.5 text-xs font-medium rounded-full"
            style={{
              backgroundColor: benefit.color + '20',
              color: benefit.color,
            }}
          >
            {benefit.badge}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{benefit.subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {benefit.is_active ? (
            <ToggleRight className="w-5 h-5 text-green-600" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-gray-400" />
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function LoginBenefitsPage() {
  const { benefits, loading, createBenefit, updateBenefit, deleteBenefit, toggleStatus, reorderBenefits, refetch } =
    useLoginBenefits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<LoginBenefit | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [benefitToDelete, setBenefitToDelete] = useState<LoginBenefit | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    icon: '',
    title: '',
    subtitle: '',
    color: '#00AA55',
    badge: '',
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setFormData({
      icon: '',
      title: '',
      subtitle: '',
      color: '#00AA55',
      badge: '',
      is_active: true,
    });
    setEditingBenefit(null);
  };

  const handleOpenModal = (benefit?: LoginBenefit) => {
    if (benefit) {
      setEditingBenefit(benefit);
      setFormData({
        icon: benefit.icon,
        title: benefit.title,
        subtitle: benefit.subtitle,
        color: benefit.color,
        badge: benefit.badge,
        is_active: benefit.is_active,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.icon || !formData.title || !formData.subtitle || !formData.badge) return;

    if (editingBenefit) {
      await updateBenefit(editingBenefit.id, formData);
    } else {
      await createBenefit({
        ...formData,
        sort_order: benefits.length + 1,
      });
    }
    handleCloseModal();
  };

  const handleDeleteClick = (benefit: LoginBenefit) => {
    setBenefitToDelete(benefit);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (benefitToDelete) {
      await deleteBenefit(benefitToDelete.id);
      setDeleteModalOpen(false);
      setBenefitToDelete(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = benefits.findIndex((b) => b.id === active.id);
      const newIndex = benefits.findIndex((b) => b.id === over.id);
      const reordered = arrayMove(benefits, oldIndex, newIndex);
      reorderBenefits(reordered);
    }
  };

  const emojiSuggestions = ['🎁', '💳', '🚚', '⭐', '🔔', '💰', '🏷️', '📦', '🎉', '💎'];
  const iconNameSuggestions = ['shield-checkmark', 'gift', 'card', 'cart', 'heart', 'star', 'rocket', 'flash', 'trophy', 'percent'];

  if (loading) {
    return <Loading size="lg" text="Giriş avantajları yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giriş Avantajları</h1>
          <p className="text-gray-500 mt-1">
            Giriş ekranında kullanıcılara gösterilen avantajları yönetin
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPreviewModalOpen(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Önizle
          </Button>

          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>

          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Avantaj
          </Button>
        </div>
      </div>

      {/* Benefits List */}
      {benefits.length === 0 ? (
        <Card className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Henüz giriş avantajı bulunmuyor</p>
          <Button onClick={() => handleOpenModal()} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            İlk Avantajı Ekle
          </Button>
        </Card>
      ) : (
        <Card className="p-4">
          <p className="text-sm text-gray-500 mb-4">
            Sıralamayı değiştirmek için sürükle ve bırak yapabilirsiniz
          </p>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={benefits.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {benefits.map((benefit) => (
                  <SortableBenefitItem
                    key={benefit.id}
                    benefit={benefit}
                    onEdit={() => handleOpenModal(benefit)}
                    onDelete={() => handleDeleteClick(benefit)}
                    onToggle={() => toggleStatus(benefit.id, !benefit.is_active)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBenefit ? 'Avantajı Düzenle' : 'Yeni Avantaj'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İkon (Emoji veya İkon Adı)
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🎁 veya shield-checkmark"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div>
                <p className="text-xs text-gray-500 mb-1">Emojiler:</p>
                <div className="flex flex-wrap gap-1">
                  {emojiSuggestions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className="w-8 h-8 rounded hover:bg-gray-100 text-lg"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">İkon Adları:</p>
                <div className="flex flex-wrap gap-1">
                  {iconNameSuggestions.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconName })}
                      className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100 flex items-center gap-1"
                    >
                      <IconRenderer icon={iconName} size={14} color="#666" />
                      <span>{iconName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Input
            label="Başlık"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Özel Fırsatlar"
            required
          />

          <Input
            label="Alt Başlık"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Sadece üyelere özel indirimler"
            required
          />

          <Input
            label="Rozet Metni"
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            placeholder="YENİ"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Aktif
            </label>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Önizleme:</p>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: formData.color + '20' }}
              >
                {formData.icon ? (
                  <IconRenderer icon={formData.icon} size={20} color={formData.color} />
                ) : (
                  <span className="text-xl text-gray-400">?</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formData.title || 'Başlık'}
                  </span>
                  {formData.badge && (
                    <span
                      className="px-1.5 py-0.5 text-xs font-medium rounded"
                      style={{
                        backgroundColor: formData.color + '20',
                        color: formData.color,
                      }}
                    >
                      {formData.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{formData.subtitle || 'Alt başlık'}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              İptal
            </Button>
            <Button
              type="submit"
              disabled={!formData.icon || !formData.title || !formData.subtitle || !formData.badge}
            >
              {editingBenefit ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Avantajı Sil"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <p className="text-sm text-red-700">
              &quot;{benefitToDelete?.title}&quot; avantajı silinecek. Bu işlem geri alınamaz.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              İptal
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Sil
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Giriş Ekranı Önizlemesi"
        size="sm"
      >
        <div className="bg-gray-900 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold text-center mb-4">
            Neden Giriş Yapmalısınız?
          </h3>
          <div className="space-y-3">
            {benefits
              .filter((b) => b.is_active)
              .map((benefit) => (
                <div
                  key={benefit.id}
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-lg"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: benefit.color + '40' }}
                  >
                    <IconRenderer icon={benefit.icon} size={20} color="white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{benefit.title}</span>
                      <span
                        className="px-1.5 py-0.5 text-xs font-medium rounded"
                        style={{
                          backgroundColor: benefit.color,
                          color: 'white',
                        }}
                      >
                        {benefit.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">{benefit.subtitle}</p>
                  </div>
                </div>
              ))}
          </div>
          {benefits.filter((b) => b.is_active).length === 0 && (
            <p className="text-center text-gray-400 py-4">Aktif avantaj bulunmuyor</p>
          )}
        </div>
      </Modal>
    </div>
  );
}

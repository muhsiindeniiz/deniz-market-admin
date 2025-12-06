'use client';

import { useState } from 'react';
import { useStores } from '@/hooks/useStores';
import { Store } from '@/lib/types';
import { Loading } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { SingleImageUpload } from '@/components/ui/SingleImageUpload';
import {
  Store as StoreIcon,
  Plus,
  Pencil,
  Trash2,
  Star,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Package,
} from 'lucide-react';

export default function StoresPage() {
  const { stores, loading, createStore, updateStore, deleteStore, toggleStoreStatus, refetch } =
    useStores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    is_active: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      phone: '',
      email: '',
      address: '',
      is_active: true,
    });
    setLogoFile(null);
    setBannerFile(null);
    setLogoPreview(null);
    setBannerPreview(null);
    setRemoveLogo(false);
    setRemoveBanner(false);
    setEditingStore(null);
  };

  const handleOpenModal = (store?: Store) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name,
        description: store.description || '',
        phone: store.phone || '',
        email: store.email || '',
        address: store.address || '',
        is_active: store.is_active,
      });
      setLogoPreview(store.logo);
      setBannerPreview(store.banner_image);
      setRemoveLogo(false);
      setRemoveBanner(false);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
      setRemoveLogo(false);
    } else {
      setLogoPreview(null);
      setRemoveLogo(true);
    }
  };

  const handleBannerChange = (file: File | null) => {
    setBannerFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
      setRemoveBanner(false);
    } else {
      setBannerPreview(null);
      setRemoveBanner(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setSubmitting(true);
    try {
      if (editingStore) {
        await updateStore(
          editingStore.id,
          {
            name: formData.name,
            description: formData.description || null,
            phone: formData.phone || null,
            email: formData.email || null,
            address: formData.address || null,
            is_active: formData.is_active,
            logo: editingStore.logo,
            banner_image: editingStore.banner_image,
          },
          logoFile || undefined,
          bannerFile || undefined,
          removeLogo,
          removeBanner
        );
      } else {
        await createStore(
          {
            name: formData.name,
            description: formData.description || null,
            phone: formData.phone || null,
            email: formData.email || null,
            address: formData.address || null,
            is_active: formData.is_active,
            logo: null,
            banner_image: null,
          },
          logoFile || undefined,
          bannerFile || undefined
        );
      }
      handleCloseModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (store: Store) => {
    setStoreToDelete(store);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (storeToDelete) {
      await deleteStore(storeToDelete.id);
      setDeleteModalOpen(false);
      setStoreToDelete(null);
    }
  };

  if (loading) {
    return <Loading size="lg" text="Mağazalar yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mağazalar</h1>
          <p className="text-gray-500 mt-1">Mağaza yönetimi ve ayarları</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>

          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Mağaza
          </Button>
        </div>
      </div>

      {/* Stores Grid */}
      {stores.length === 0 ? (
        <Card className="p-8 text-center">
          <StoreIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Henüz mağaza bulunmuyor</p>
          <Button onClick={() => handleOpenModal()} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            İlk Mağazayı Ekle
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store.id} className="overflow-hidden">
              {/* Banner */}
              <div className="relative h-32 bg-gradient-to-r from-green-500 to-green-600">
                {store.banner_image && (
                  <img
                    src={store.banner_image}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      store.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {store.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              {/* Logo */}
              <div className="relative -mt-10 ml-4">
                <div className="w-20 h-20 rounded-xl bg-white border-4 border-white shadow-lg overflow-hidden">
                  {store.logo ? (
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <StoreIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 pt-2">
                <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                {store.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {store.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {store.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Package className="w-4 h-4" />
                    <span>{store.review_count || 0} değerlendirme</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-2 text-sm">
                  {store.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  {store.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{store.email}</span>
                    </div>
                  )}
                  {store.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{store.address}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                  {/* Aktif/Pasif butonu yorum satırına alındı
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStoreStatus(store.id, !store.is_active)}
                  >
                    {store.is_active ? (
                      <>
                        <ToggleRight className="w-4 h-4 mr-1 text-green-600" />
                        <span className="text-green-600">Aktif</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-gray-500">Pasif</span>
                      </>
                    )}
                  </Button>
                  */}

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(store)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {/* Silme butonu yorum satırına alındı
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(store)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    */}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStore ? 'Mağaza Düzenle' : 'Yeni Mağaza'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mağaza Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Mağaza adı"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mağaza açıklaması"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+90 555 123 4567"
            />

            <Input
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="info@magaza.com"
            />
          </div>

          <Input
            label="Adres"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Mağaza adresi"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <SingleImageUpload
                value={logoPreview}
                onChange={handleLogoChange}
                aspectRatio="square"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Görseli
              </label>
              <SingleImageUpload
                value={bannerPreview}
                onChange={handleBannerChange}
                aspectRatio="wide"
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
              Mağaza Aktif
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              İptal
            </Button>
            <Button type="submit" disabled={submitting || !formData.name}>
              {submitting ? 'Kaydediliyor...' : editingStore ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Mağazayı Sil"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-sm text-red-700 font-medium">
                &quot;{storeToDelete?.name}&quot; mağazası silinecek.
              </p>
              <p className="text-sm text-red-600 mt-1">
                Bu işlem geri alınamaz ve mağazaya ait ürünler etkilenebilir.
              </p>
            </div>
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
    </div>
  );
}

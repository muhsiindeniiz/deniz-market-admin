// app/dashboard/customers/page.tsx
'use client';

import { useState } from 'react';
import { useCustomers, CustomerWithDetails } from '@/hooks/useCustomers';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Address } from '@/lib/types';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import {
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Edit,
  Trash2,
  Eye,
  Plus,
} from 'lucide-react';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithDetails | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const {
    customers,
    loading,
    totalPages,
    totalCount,
    updateCustomer,
    deleteCustomer,
    addAddress,
    updateAddress,
    deleteAddress,
  } = useCustomers({ search, page });

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
  });

  // Address form state
  const [addressForm, setAddressForm] = useState({
    title: '',
    full_address: '',
    city: '',
    district: '',
    postal_code: '',
    is_default: false,
  });

  const handleViewCustomer = (customer: CustomerWithDetails) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleEditCustomer = (customer: CustomerWithDetails) => {
    setSelectedCustomer(customer);
    setEditForm({
      full_name: customer.full_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      birth_date: customer.birth_date || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveCustomer = async () => {
    if (!selectedCustomer) return;

    const success = await updateCustomer(selectedCustomer.id, {
      full_name: editForm.full_name,
      phone: editForm.phone,
      birth_date: editForm.birth_date || null,
    });

    if (success) {
      // Modal içindeki selectedCustomer'ı güncelle
      setSelectedCustomer({
        ...selectedCustomer,
        full_name: editForm.full_name,
        phone: editForm.phone,
        birth_date: editForm.birth_date || null,
      });
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteCustomer = async (customer: CustomerWithDetails) => {
    if (
      confirm(
        `${customer.full_name || customer.email} adlı müşteriyi silmek istediğinizden emin misiniz?`
      )
    ) {
      await deleteCustomer(customer.id);
    }
  };

  const handleAddAddress = (customer: CustomerWithDetails) => {
    setSelectedCustomer(customer);
    setEditingAddress(null);
    setAddressForm({
      title: '',
      full_address: '',
      city: '',
      district: '',
      postal_code: '',
      is_default: false,
    });
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (customer: CustomerWithDetails, address: Address) => {
    setSelectedCustomer(customer);
    setEditingAddress(address);
    setAddressForm({
      title: address.title,
      full_address: address.full_address,
      city: address.city,
      district: address.district,
      postal_code: address.postal_code || '',
      is_default: address.is_default,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!selectedCustomer) return;

    let success;
    if (editingAddress) {
      success = await updateAddress(editingAddress.id, selectedCustomer.id, addressForm);
    } else {
      success = await addAddress(selectedCustomer.id, addressForm);
    }

    if (success) {
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      // selectedCustomer'ı güncelle - customers listesinden güncel veriyi al
      const updatedCustomer = customers.find((c) => c.id === selectedCustomer.id);
      if (updatedCustomer) {
        setSelectedCustomer(updatedCustomer);
      }
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Bu adresi silmek istediğinizden emin misiniz?') && selectedCustomer) {
      await deleteAddress(addressId, selectedCustomer.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
        <p className="text-gray-500 mt-1">Toplam {totalCount} kayıtlı müşteri</p>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Ad, e-posta veya telefon ara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : customers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Müşteri bulunamadı</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Siparişler
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => {
                    const defaultAddress = customer.addresses?.find((a) => a.is_default);
                    const firstAddress = customer.addresses?.[0];
                    const displayAddress = defaultAddress || firstAddress;

                    return (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {customer.full_name || 'İsimsiz'}
                              </p>
                              {customer.birth_date && (
                                <p className="text-xs text-gray-500">
                                  Doğum: {formatDateShort(customer.birth_date)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{customer.email}</span>
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {displayAddress ? (
                            <div className="flex items-start gap-2 text-sm max-w-[250px]">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-700">{displayAddress.title}</p>
                                <p className="text-gray-500 truncate">
                                  {displayAddress.district}, {displayAddress.city}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Adres yok</span>
                          )}
                          {customer.addresses && customer.addresses.length > 1 && (
                            <Badge variant="info" size="sm" className="mt-1">
                              +{customer.addresses.length - 1} adres
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatDateShort(customer.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-gray-400" />
                              <Badge variant={customer.order_count! > 0 ? 'success' : 'default'}>
                                {customer.order_count} sipariş
                              </Badge>
                            </div>
                            {customer.total_spent! > 0 && (
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(customer.total_spent!)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                              title="Detay"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCustomer(customer)}
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer)}
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>

      {/* Müşteri Detay Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCustomer(null);
        }}
        title="Müşteri Detayı"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Müşteri Bilgileri */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedCustomer.full_name || 'İsimsiz'}
                </h3>
                <p className="text-gray-500">{selectedCustomer.email}</p>
                {selectedCustomer.phone && <p className="text-gray-500">{selectedCustomer.phone}</p>}
                {selectedCustomer.birth_date && (
                  <p className="text-sm text-gray-400 mt-1">
                    Doğum: {formatDateShort(selectedCustomer.birth_date)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <Badge variant="success">{selectedCustomer.order_count} sipariş</Badge>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  {formatCurrency(selectedCustomer.total_spent || 0)}
                </p>
              </div>
            </div>

            {/* Kayıt Bilgileri */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">
                Kayıt Tarihi: {formatDateShort(selectedCustomer.created_at)}
              </p>
            </div>

            {/* Adresler */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Adresler</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddAddress(selectedCustomer)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adres Ekle
                </Button>
              </div>

              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                <div className="space-y-3">
                  {selectedCustomer.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-gray-200 rounded-lg p-4 relative group"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{address.title}</p>
                            {address.is_default && (
                              <Badge variant="success" size="sm">
                                Varsayılan
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{address.full_address}</p>
                          <p className="text-sm text-gray-500">
                            {address.district}, {address.city}
                            {address.postal_code && ` - ${address.postal_code}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAddress(selectedCustomer, address)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Kayıtlı adres yok</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Müşteri Düzenleme Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        title="Müşteri Düzenle"
      >
        <div className="space-y-4">
          <Input
            label="Ad Soyad"
            value={editForm.full_name}
            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
          />
          <Input
            label="E-posta"
            type="email"
            value={editForm.email}
            disabled
            helperText="E-posta adresi değiştirilemez"
          />
          <Input
            label="Telefon"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            placeholder="05XX XXX XXXX"
          />
          <Input
            label="Doğum Tarihi"
            type="date"
            value={editForm.birth_date}
            onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
          />

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedCustomer(null);
              }}
            >
              İptal
            </Button>
            <Button onClick={handleSaveCustomer}>Kaydet</Button>
          </div>
        </div>
      </Modal>

      {/* Adres Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? 'Adresi Düzenle' : 'Yeni Adres'}
      >
        <div className="space-y-4">
          <Input
            label="Adres Başlığı"
            value={addressForm.title}
            onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
            placeholder="Ev, İş, vb."
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açık Adres</label>
            <textarea
              value={addressForm.full_address}
              onChange={(e) => setAddressForm({ ...addressForm, full_address: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Mahalle, sokak, bina no, daire no..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="İl"
              value={addressForm.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              required
            />
            <Input
              label="İlçe"
              value={addressForm.district}
              onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
              required
            />
          </div>
          <Input
            label="Posta Kodu"
            value={addressForm.postal_code}
            onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addressForm.is_default}
              onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Varsayılan adres olarak ayarla</span>
          </label>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddressModalOpen(false);
                setEditingAddress(null);
              }}
            >
              İptal
            </Button>
            <Button onClick={handleSaveAddress}>{editingAddress ? 'Güncelle' : 'Ekle'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
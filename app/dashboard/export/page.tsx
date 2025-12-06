'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  exportProducts,
  exportOrders,
  exportCustomers,
  exportCategories,
  exportReviews,
} from '@/lib/export';
import toast from 'react-hot-toast';
import {
  Download,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Star,
  FileSpreadsheet,
  FileJson,
  Loader2,
  Calendar,
} from 'lucide-react';

type ExportType = 'products' | 'orders' | 'customers' | 'categories' | 'reviews';
type ExportFormat = 'csv' | 'json';

interface ExportItem {
  type: ExportType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  supportsDateFilter?: boolean;
}

const exportItems: ExportItem[] = [
  {
    type: 'products',
    label: 'Ürünler',
    description: 'Tüm ürün bilgilerini dışa aktar',
    icon: Package,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    type: 'orders',
    label: 'Siparişler',
    description: 'Sipariş geçmişini dışa aktar',
    icon: ShoppingCart,
    color: 'bg-green-100 text-green-600',
    supportsDateFilter: true,
  },
  {
    type: 'customers',
    label: 'Müşteriler',
    description: 'Müşteri bilgilerini dışa aktar',
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    type: 'categories',
    label: 'Kategoriler',
    description: 'Kategori listesini dışa aktar',
    icon: FolderTree,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    type: 'reviews',
    label: 'Değerlendirmeler',
    description: 'Ürün değerlendirmelerini dışa aktar',
    icon: Star,
    color: 'bg-orange-100 text-orange-600',
  },
];

export default function ExportPage() {
  const [selectedType, setSelectedType] = useState<ExportType | null>(null);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const selectedItem = exportItems.find((item) => item.type === selectedType);

  const handleExport = async () => {
    if (!selectedType) return;

    setIsExporting(true);
    let success = false;

    const options = {
      format,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };

    try {
      switch (selectedType) {
        case 'products':
          success = await exportProducts(options);
          break;
        case 'orders':
          success = await exportOrders(options);
          break;
        case 'customers':
          success = await exportCustomers(options);
          break;
        case 'categories':
          success = await exportCategories(options);
          break;
        case 'reviews':
          success = await exportReviews(options);
          break;
      }

      if (success) {
        toast.success('Veriler başarıyla dışa aktarıldı');
      } else {
        toast.error('Dışa aktarma sırasında hata oluştu');
      }
    } catch {
      toast.error('Dışa aktarma sırasında hata oluştu');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Veri Dışa Aktarma</h1>
        <p className="text-gray-500 mt-1">Verilerinizi CSV veya JSON formatında dışa aktarın</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Type Selection */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dışa Aktarılacak Veriyi Seçin</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exportItems.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedType === item.type;

                return (
                  <button
                    key={item.type}
                    onClick={() => setSelectedType(item.type)}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Export Options */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dışa Aktarma Seçenekleri</h2>

            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormat('csv')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    format === 'csv'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="font-medium">CSV</span>
                </button>
                <button
                  onClick={() => setFormat('json')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    format === 'json'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <FileJson className="w-5 h-5" />
                  <span className="font-medium">JSON</span>
                </button>
              </div>
            </div>

            {/* Date Filter (for orders) */}
            {selectedItem?.supportsDateFilter && (
              <div className="mb-6 space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Tarih Aralığı (Opsiyonel)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="Başlangıç"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="Bitiş"
                  />
                </div>
              </div>
            )}

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={!selectedType || isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Dışa Aktarılıyor...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Dışa Aktar
                </>
              )}
            </Button>

            {!selectedType && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Lütfen dışa aktarılacak veriyi seçin
              </p>
            )}
          </Card>

          {/* Info Card */}
          <Card className="p-4 mt-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Dışa Aktarma Hakkında</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• CSV formatı Excel ile uyumludur</li>
                  <li>• JSON formatı yazılım entegrasyonları için uygundur</li>
                  <li>• Tüm veriler UTF-8 kodlamasıyla kaydedilir</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

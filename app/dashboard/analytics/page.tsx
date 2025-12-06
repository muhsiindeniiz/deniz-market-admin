'use client';

import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Loading } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Heart,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote,
  Calendar,
  RefreshCw,
  Download,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/Button';

const COLORS = ['#00AA55', '#1990FF', '#FF6B6B', '#FFB347', '#9370DB', '#00BCD4', '#FF9800', '#E91E63'];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const {
    analytics,
    salesData,
    hourlyData,
    categoryStats,
    topProducts,
    paymentMethodData,
    loading,
    refetch,
  } = useAnalytics(dateRange);

  const handleExportCSV = () => {
    if (!salesData.length) return;

    const headers = ['Tarih', 'Sipariş Sayısı', 'Gelir (₺)'];
    const rows = salesData.map((d) => [d.date, d.orders.toString(), d.revenue.toFixed(2)]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Revenue Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              </div>
              <div className="mt-4 h-4 w-28 bg-gray-200 rounded animate-pulse" />
            </Card>
          ))}
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />
            </Card>
          ))}
        </div>

        {/* Pie Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-[250px] bg-gray-100 rounded-lg animate-pulse" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Veri bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
          <p className="text-gray-500 mt-1">Detaylı istatistikler ve raporlar</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: 'week', label: 'Hafta' },
              { value: 'month', label: 'Ay' },
              { value: 'year', label: 'Yıl' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setDateRange(item.value as 'week' | 'month' | 'year')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  dateRange === item.value
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            CSV İndir
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(analytics.revenue.total)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {analytics.revenue.growth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                analytics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {analytics.revenue.growth >= 0 ? '+' : ''}
              {analytics.revenue.growth.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">geçen aya göre</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Bu Ay Gelir</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(analytics.revenue.month)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Geçen ay: {formatCurrency(analytics.revenue.previousMonth)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Bugünkü Gelir</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(analytics.revenue.today)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Bu hafta: {formatCurrency(analytics.revenue.week)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ortalama Sipariş</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(analytics.orders.averageValue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Toplam {analytics.orders.total} sipariş
            </p>
          </div>
        </Card>
      </div>

      {/* Orders & Customers Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.orders.pending}</p>
          <p className="text-xs text-gray-500">Bekleyen</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.orders.completed}</p>
          <p className="text-xs text-gray-500">Tamamlanan</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.orders.cancelled}</p>
          <p className="text-xs text-gray-500">İptal</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.customers.total}</p>
          <p className="text-xs text-gray-500">Müşteri</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.customers.new}</p>
          <p className="text-xs text-gray-500">Yeni Müşteri</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Package className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.products.total}</p>
          <p className="text-xs text-gray-500">Ürün</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.products.lowStock}</p>
          <p className="text-xs text-gray-500">Düşük Stok</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.favorites.total}</p>
          <p className="text-xs text-gray-500">Favori</p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gelir Trendi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00AA55" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00AA55" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value: number) => `₺${(value / 1000).toFixed(0)}K`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Gelir']}
                labelFormatter={(label: string) => formatDate(label)}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00AA55"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Orders Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Trendi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [value, 'Sipariş']}
                labelFormatter={(label: string) => formatDate(label)}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#1990FF"
                strokeWidth={2}
                dot={{ fill: '#1990FF', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Yöntemleri</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentMethodData as any}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="count"
                nameKey="method"
                label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.method === 'Nakit' ? '#00AA55' : '#1990FF'}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value} sipariş (${formatCurrency(props.payload.revenue)})`,
                  props.payload.method,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {paymentMethodData.map((item) => (
              <div key={item.method} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {item.method === 'Nakit' ? (
                    <Banknote className="w-4 h-4 text-green-500" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="text-gray-600">{item.method}</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Hourly Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Saatlik Dağılım (Bugün)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'orders' ? `${value} sipariş` : formatCurrency(value),
                  name === 'orders' ? 'Sipariş' : 'Gelir',
                ]}
              />
              <Bar dataKey="orders" fill="#1990FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Category Stats & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Performansı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={(value: number) => `₺${(value / 1000).toFixed(0)}K`} />
              <YAxis
                dataKey="category_name"
                type="category"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'total_revenue' ? formatCurrency(value) : `${value} adet`,
                  name === 'total_revenue' ? 'Gelir' : 'Satış',
                ]}
              />
              <Bar dataKey="total_revenue" fill="#00AA55" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">En Çok Satan Ürünler</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {topProducts.map((product, index) => (
              <div
                key={product.product_id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold text-sm">
                  {index + 1}
                </div>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.product_name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.product_name}
                  </p>
                  <p className="text-xs text-gray-500">{product.total_sold} adet satıldı</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(product.total_revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Favorite Products */}
      {analytics.favorites.topProducts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Heart className="w-5 h-5 inline-block mr-2 text-red-500" />
            En Çok Favorilere Eklenen Ürünler
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {analytics.favorites.topProducts.slice(0, 10).map((product) => (
              <div
                key={product.product_id}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.product_name}
                    className="w-16 h-16 rounded-lg object-cover mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center mb-2">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <p className="text-sm font-medium text-gray-900 text-center truncate w-full">
                  {product.product_name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-semibold text-gray-600">
                    {product.favorite_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Product Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Düşük Stok Uyarısı</h3>
          </div>
          <p className="text-gray-600">
            <span className="text-2xl font-bold text-orange-500">{analytics.products.lowStock}</span>{' '}
            ürün düşük stokta (10 veya daha az)
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Stok tükenmeden önce bu ürünleri kontrol edin.
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Stok Tükendi</h3>
          </div>
          <p className="text-gray-600">
            <span className="text-2xl font-bold text-red-500">{analytics.products.outOfStock}</span>{' '}
            ürün stokta yok
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Bu ürünler için acil stok yenileme gerekiyor.
          </p>
        </Card>
      </div>
    </div>
  );
}

interface PaymentMethodData {
  method: string;
  count: number;
  revenue: number;
}

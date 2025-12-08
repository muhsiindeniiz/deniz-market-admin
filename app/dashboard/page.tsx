'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStats } from '@/hooks/useStats';
import { useOrders } from '@/hooks/useOrders';
import { supabase } from '@/lib/supabase/client';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { CategoryStats } from '@/components/dashboard/CategoryStats';
import { Loading } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  Clock,
  Calendar,
  AlertTriangle,
  Star,
  Heart,
  Bell,
  RefreshCw,
  ArrowRight,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  images: string[];
  category?: { name: string };
}

interface QuickStat {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  href?: string;
}

export default function DashboardPage() {
  const { stats, categoryStats, topProducts, salesData, loading: statsLoading, refetch: refetchStats } = useStats();
  const { orders, loading: ordersLoading } = useOrders({ page: 1 });
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<LowStockProduct[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        // Fetch low stock products (stock between 1-10)
        const { data: lowStock } = await supabase
          .from('products')
          .select('*, category:categories(name)')
          .gt('stock', 0)
          .lte('stock', 10)
          .order('stock', { ascending: true })
          .limit(5);

        // Fetch out of stock products
        const { data: outOfStock } = await supabase
          .from('products')
          .select('*, category:categories(name)')
          .eq('stock', 0)
          .order('updated_at', { ascending: false })
          .limit(5);

        // Count pending orders
        const { count: pending } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'processing', 'preparing']);

        // Count unread notifications
        const { count: unread } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);

        // Count total favorites
        const { count: favorites } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true });

        // Count total reviews
        const { count: reviews } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });

        setLowStockProducts(lowStock || []);
        setOutOfStockProducts(outOfStock || []);
        setPendingOrdersCount(pending || 0);
        setUnreadNotifications(unread || 0);
        setTotalFavorites(favorites || 0);
        setTotalReviews(reviews || 0);
      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    };

    fetchAdditionalData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchStats();
    setIsRefreshing(false);
  };

  if (statsLoading || ordersLoading) {
    return <Loading size="lg" text="Dashboard yükleniyor..." />;
  }

  const quickStats: QuickStat[] = [
    {
      label: 'Bekleyen Sipariş',
      value: pendingOrdersCount,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100',
      href: '/dashboard/orders?status=pending',
    },
    {
      label: 'Düşük Stok',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-100',
      href: '/dashboard/products?stock=low',
    },
    {
      label: 'Stok Tükendi',
      value: outOfStockProducts.length,
      icon: XCircle,
      color: 'text-red-600 bg-red-100',
      href: '/dashboard/products?stock=out',
    },
    {
      label: 'Okunmamış Bildirim',
      value: unreadNotifications,
      icon: Bell,
      color: 'text-blue-600 bg-blue-100',
      href: '/dashboard/notifications',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Mağaza genel durumunuz</p>
        </div>

        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Yenile
        </Button>
      </div>

      {/* Quick Action Alerts */}
      {(pendingOrdersCount > 0 || outOfStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingOrdersCount > 0 && (
            <Card className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      {pendingOrdersCount} bekleyen sipariş var
                    </p>
                    <p className="text-sm text-yellow-600">
                      Siparişleri onaylayın veya hazırlamaya başlayın
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/orders?status=pending">
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                    Görüntüle
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {outOfStockProducts.length > 0 && (
            <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">
                      {outOfStockProducts.length} ürün stokta yok
                    </p>
                    <p className="text-sm text-red-600">
                      Acil stok yenilemesi gerekiyor
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/products?stock=out">
                  <Button size="sm" variant="danger">
                    Görüntüle
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Toplam Sipariş"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="blue"
        />
        <StatsCard
          title="Toplam Gelir"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Müşteriler"
          value={stats?.totalCustomers || 0}
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Ürünler"
          value={stats?.totalProducts || 0}
          icon={Package}
          color="yellow"
        />
        <StatsCard
          title="Bekleyen Sipariş"
          value={stats?.pendingOrders || 0}
          icon={Clock}
          color="red"
        />
        <StatsCard
          title="Bugünkü Gelir"
          value={formatCurrency(stats?.todayRevenue || 0)}
          icon={Calendar}
          color="green"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          );

          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg text-pink-600 bg-pink-100">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalFavorites}</p>
              <p className="text-xs text-gray-500">Favoriler</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg text-amber-600 bg-amber-100">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
              <p className="text-xs text-gray-500">Değerlendirme</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesData} />
        <CategoryStats data={categoryStats} />
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Düşük Stok Uyarısı</h3>
            </div>
            <Link href="/dashboard/products?stock=low">
              <Button variant="ghost" size="sm">
                Tümünü Gör
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Ürün
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Kategori
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Stok
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lowStockProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock <= 5
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {product.stock} adet
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/products/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          Düzenle
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={orders.slice(0, 5)} />
        <TopProducts products={topProducts} />
      </div>

      {/* Order Status Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Durumu Özeti</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { status: 'pending', label: 'Sipariş Alındı', icon: Clock, color: 'yellow' },
            { status: 'processing', label: 'Hazırlanıyor', icon: Loader2, color: 'blue' },
            { status: 'preparing', label: 'Paketleniyor', icon: Package, color: 'purple' },
            { status: 'on_delivery', label: 'Yolda', icon: Truck, color: 'orange' },
            { status: 'delivered', label: 'Teslim Edildi', icon: CheckCircle, color: 'green' },
            { status: 'cancelled', label: 'İptal Edildi', icon: XCircle, color: 'red' },
          ].map((item) => {
            const count = orders.filter((o) => o.status === item.status).length;
            const Icon = item.icon;

            return (
              <div
                key={item.status}
                className={`p-4 rounded-lg bg-${item.color}-50 border border-${item.color}-100`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 text-${item.color}-600`} />
                  <span className={`text-sm font-medium text-${item.color}-700`}>
                    {item.label}
                  </span>
                </div>
                <p className={`text-2xl font-bold text-${item.color}-900`}>{count}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

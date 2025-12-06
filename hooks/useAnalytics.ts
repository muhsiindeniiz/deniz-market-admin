'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AnalyticsData, CategoryStat, TopProduct } from '@/lib/types';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
  format,
} from 'date-fns';

interface SalesData {
  date: string;
  orders: number;
  revenue: number;
}

interface HourlyData {
  hour: string;
  orders: number;
  revenue: number;
}

interface PaymentMethodData {
  method: string;
  count: number;
  revenue: number;
}

interface OrderStatusData {
  status: string;
  count: number;
}

export function useAnalytics(dateRange: 'week' | 'month' | 'year' = 'month') {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodData[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));

      // Determine date range for chart
      let chartStartDate: Date;
      switch (dateRange) {
        case 'week':
          chartStartDate = subDays(now, 7);
          break;
        case 'year':
          chartStartDate = subDays(now, 365);
          break;
        default:
          chartStartDate = subDays(now, 30);
      }

      // Fetch all data in parallel
      const [
        { data: allOrders },
        { data: allUsers },
        { data: allProducts },
        { data: orderItemsWithProducts },
        { data: categories },
        { data: favorites },
      ] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('users').select('id, created_at'),
        supabase.from('products').select('id, name, stock, is_featured, is_on_sale, images'),
        supabase.from('order_items').select(`
          quantity,
          price,
          order_id,
          product:products (
            id,
            name,
            images,
            category_id
          )
        `),
        supabase.from('categories').select('id, name'),
        supabase.from('favorites').select(`
          id,
          product_id,
          product:products (
            id,
            name,
            images
          )
        `),
      ]);

      const orders = allOrders || [];
      const users = allUsers || [];
      const products = allProducts || [];

      // Filter orders by status
      const validOrders = orders.filter((o) => o.status !== 'cancelled');
      const deliveredOrders = orders.filter((o) => o.status === 'delivered');
      const cancelledOrders = orders.filter((o) => o.status === 'cancelled');
      const pendingOrders = orders.filter((o) =>
        ['pending', 'processing', 'preparing'].includes(o.status)
      );

      // Revenue calculations
      const calcRevenue = (arr: typeof orders) =>
        arr.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      const todayOrders = validOrders.filter((o) => {
        const d = new Date(o.created_at);
        return d >= todayStart && d <= todayEnd;
      });

      const weeklyOrders = validOrders.filter((o) => {
        const d = new Date(o.created_at);
        return d >= weekStart && d <= weekEnd;
      });

      const monthlyOrders = validOrders.filter((o) => {
        const d = new Date(o.created_at);
        return d >= monthStart && d <= monthEnd;
      });

      const previousMonthOrders = validOrders.filter((o) => {
        const d = new Date(o.created_at);
        return d >= previousMonthStart && d <= previousMonthEnd;
      });

      const totalRevenue = calcRevenue(validOrders);
      const monthRevenue = calcRevenue(monthlyOrders);
      const previousMonthRevenue = calcRevenue(previousMonthOrders);
      const revenueGrowth =
        previousMonthRevenue > 0
          ? ((monthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
          : 0;

      // Customer analysis
      const newCustomersThisMonth = users.filter((u) => {
        const d = new Date(u.created_at);
        return d >= monthStart && d <= monthEnd;
      });

      // Find customers who have ordered this month
      const customersWithOrdersThisMonth = new Set(
        monthlyOrders.map((o) => o.user_id)
      );

      // Products analysis
      const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 10);
      const outOfStockProducts = products.filter((p) => p.stock === 0);
      const featuredProducts = products.filter((p) => p.is_featured);
      const onSaleProducts = products.filter((p) => p.is_on_sale);

      // Favorites analysis
      const favoriteCountMap = new Map<string, { count: number; name: string; image: string }>();
      (favorites || []).forEach((fav) => {
        const product = Array.isArray(fav.product) ? fav.product[0] : fav.product;
        if (product) {
          const existing = favoriteCountMap.get(product.id);
          if (existing) {
            existing.count += 1;
          } else {
            favoriteCountMap.set(product.id, {
              count: 1,
              name: product.name,
              image: product.images?.[0] || '',
            });
          }
        }
      });

      const topFavorites = Array.from(favoriteCountMap.entries())
        .map(([id, data]) => ({
          product_id: id,
          product_name: data.name,
          favorite_count: data.count,
          image: data.image,
        }))
        .sort((a, b) => b.favorite_count - a.favorite_count)
        .slice(0, 10);

      // Set analytics data
      setAnalytics({
        revenue: {
          total: totalRevenue,
          today: calcRevenue(todayOrders),
          week: calcRevenue(weeklyOrders),
          month: monthRevenue,
          previousMonth: previousMonthRevenue,
          growth: revenueGrowth,
        },
        orders: {
          total: orders.length,
          today: todayOrders.length,
          week: weeklyOrders.length,
          month: monthlyOrders.length,
          pending: pendingOrders.length,
          completed: deliveredOrders.length,
          cancelled: cancelledOrders.length,
          averageValue: validOrders.length > 0 ? totalRevenue / validOrders.length : 0,
        },
        customers: {
          total: users.length,
          new: newCustomersThisMonth.length,
          returning: users.length - newCustomersThisMonth.length,
          activeThisMonth: customersWithOrdersThisMonth.size,
        },
        products: {
          total: products.length,
          lowStock: lowStockProducts.length,
          outOfStock: outOfStockProducts.length,
          featured: featuredProducts.length,
          onSale: onSaleProducts.length,
        },
        favorites: {
          total: favorites?.length || 0,
          topProducts: topFavorites,
        },
      });

      // Sales data for chart
      const dateMap = new Map<string, { orders: number; revenue: number }>();
      const daysDiff = Math.ceil(
        (now.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      for (let i = 0; i <= daysDiff; i++) {
        const date = format(subDays(now, i), 'yyyy-MM-dd');
        dateMap.set(date, { orders: 0, revenue: 0 });
      }

      validOrders
        .filter((o) => new Date(o.created_at) >= chartStartDate)
        .forEach((order) => {
          const date = format(new Date(order.created_at), 'yyyy-MM-dd');
          const existing = dateMap.get(date);
          if (existing) {
            existing.orders += 1;
            existing.revenue += Number(order.total_amount || 0);
          }
        });

      setSalesData(
        Array.from(dateMap.entries())
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => a.date.localeCompare(b.date))
      );

      // Hourly distribution (last 24 hours)
      const hourlyMap = new Map<number, { orders: number; revenue: number }>();
      for (let i = 0; i < 24; i++) {
        hourlyMap.set(i, { orders: 0, revenue: 0 });
      }

      todayOrders.forEach((order) => {
        const hour = new Date(order.created_at).getHours();
        const existing = hourlyMap.get(hour);
        if (existing) {
          existing.orders += 1;
          existing.revenue += Number(order.total_amount || 0);
        }
      });

      setHourlyData(
        Array.from(hourlyMap.entries())
          .map(([hour, data]) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            ...data,
          }))
          .sort((a, b) => a.hour.localeCompare(b.hour))
      );

      // Payment method distribution
      const paymentMap = new Map<string, { count: number; revenue: number }>();
      validOrders.forEach((order) => {
        const method = order.payment_method || 'unknown';
        const existing = paymentMap.get(method);
        if (existing) {
          existing.count += 1;
          existing.revenue += Number(order.total_amount || 0);
        } else {
          paymentMap.set(method, {
            count: 1,
            revenue: Number(order.total_amount || 0),
          });
        }
      });

      setPaymentMethodData(
        Array.from(paymentMap.entries()).map(([method, data]) => ({
          method: method === 'cash' ? 'Nakit' : method === 'card' ? 'Kredi Kartı' : method,
          ...data,
        }))
      );

      // Order status distribution
      const statusMap = new Map<string, number>();
      orders.forEach((order) => {
        const count = statusMap.get(order.status) || 0;
        statusMap.set(order.status, count + 1);
      });

      const statusLabels: Record<string, string> = {
        pending: 'Beklemede',
        processing: 'İşleniyor',
        preparing: 'Hazırlanıyor',
        on_delivery: 'Yolda',
        delivered: 'Teslim Edildi',
        cancelled: 'İptal',
      };

      setOrderStatusData(
        Array.from(statusMap.entries()).map(([status, count]) => ({
          status: statusLabels[status] || status,
          count,
        }))
      );

      // Category stats
      const categoryMap = new Map((categories || []).map((c) => [c.id, c.name]));
      const categoryStatsMap = new Map<string, CategoryStat>();
      const productStatsMap = new Map<
        string,
        { name: string; image: string; sold: number; revenue: number }
      >();

      (orderItemsWithProducts || []).forEach((item) => {
        const product = (Array.isArray(item.product) ? item.product[0] : item.product) as {
          id: string;
          name: string;
          images: string[];
          category_id: string;
        } | null;

        if (!product) return;

        // Category stats
        if (product.category_id) {
          const catName = categoryMap.get(product.category_id) || 'Bilinmeyen';
          const existing = categoryStatsMap.get(product.category_id);
          const revenue = Number(item.price) * item.quantity;

          if (existing) {
            existing.order_count += item.quantity;
            existing.total_revenue += revenue;
          } else {
            categoryStatsMap.set(product.category_id, {
              category_id: product.category_id,
              category_name: catName,
              order_count: item.quantity,
              total_revenue: revenue,
            });
          }
        }

        // Product stats
        const existingProduct = productStatsMap.get(product.id);
        const revenue = Number(item.price) * item.quantity;

        if (existingProduct) {
          existingProduct.sold += item.quantity;
          existingProduct.revenue += revenue;
        } else {
          productStatsMap.set(product.id, {
            name: product.name,
            image: product.images?.[0] || '',
            sold: item.quantity,
            revenue,
          });
        }
      });

      setCategoryStats(
        Array.from(categoryStatsMap.values())
          .sort((a, b) => b.order_count - a.order_count)
          .slice(0, 10)
      );

      setTopProducts(
        Array.from(productStatsMap.entries())
          .map(([id, data]) => ({
            product_id: id,
            product_name: data.name,
            image: data.image,
            total_sold: data.sold,
            total_revenue: data.revenue,
          }))
          .sort((a, b) => b.total_sold - a.total_sold)
          .slice(0, 10)
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    salesData,
    hourlyData,
    categoryStats,
    topProducts,
    paymentMethodData,
    orderStatusData,
    loading,
    refetch: fetchAnalytics,
  };
}

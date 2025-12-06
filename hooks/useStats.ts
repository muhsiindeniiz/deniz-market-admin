// hooks/useStats.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DashboardStats, CategoryStat, TopProduct } from '@/lib/types';
import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    subDays,
    format,
} from 'date-fns';

interface SalesData {
    date: string;
    orders: number;
    revenue: number;
}

export function useStats() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllStats = useCallback(async () => {
        setLoading(true);
        try {
            const now = new Date();
            const thirtyDaysAgo = subDays(now, 30);

            // Paralel olarak tüm verileri çek
            const [
                { data: allOrders },
                { count: totalCustomers },
                { count: totalProducts },
                { data: orderItemsWithProducts },
                { data: categories },
            ] = await Promise.all([
                // Tüm siparişler
                supabase.from('orders').select('id, total_amount, status, created_at'),
                // Toplam müşteri
                supabase.from('users').select('*', { count: 'exact', head: true }),
                // Toplam ürün
                supabase.from('products').select('*', { count: 'exact', head: true }),
                // Order items with products (kategori ve top products için)
                supabase.from('order_items').select(`
          quantity,
          price,
          product:products (
            id,
            name,
            images,
            category_id
          )
        `),
                // Kategoriler
                supabase.from('categories').select('id, name'),
            ]);

            // ==================
            // DASHBOARD STATS
            // ==================
            const orders = allOrders || [];
            const validOrders = orders.filter((o) => o.status !== 'cancelled');

            const todayStart = startOfDay(now);
            const todayEnd = endOfDay(now);
            const weekStart = startOfWeek(now, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
            const monthStart = startOfMonth(now);
            const monthEnd = endOfMonth(now);

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

            const pendingOrders = orders.filter((o) =>
                ['pending', 'processing', 'preparing'].includes(o.status)
            ).length;

            const calcRevenue = (arr: typeof orders) =>
                arr.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

            setStats({
                totalOrders: orders.length,
                totalRevenue: calcRevenue(validOrders),
                totalCustomers: totalCustomers || 0,
                totalProducts: totalProducts || 0,
                pendingOrders,
                todayOrders: todayOrders.length,
                todayRevenue: calcRevenue(todayOrders),
                weeklyOrders: weeklyOrders.length,
                weeklyRevenue: calcRevenue(weeklyOrders),
                monthlyOrders: monthlyOrders.length,
                monthlyRevenue: calcRevenue(monthlyOrders),
            });

            // ==================
            // SALES DATA (30 gün)
            // ==================
            const dateMap = new Map<string, { orders: number; revenue: number }>();
            for (let i = 0; i <= 30; i++) {
                const date = format(subDays(now, i), 'yyyy-MM-dd');
                dateMap.set(date, { orders: 0, revenue: 0 });
            }

            validOrders
                .filter((o) => new Date(o.created_at) >= thirtyDaysAgo)
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

            // ==================
            // CATEGORY STATS & TOP PRODUCTS
            // ==================
            const categoryMap = new Map((categories || []).map((c) => [c.id, c.name]));
            const categoryStatsMap = new Map<string, CategoryStat>();
            const productStatsMap = new Map<string,
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
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllStats();
    }, [fetchAllStats]);

    return {
        stats,
        categoryStats,
        topProducts,
        salesData,
        loading,
        refetch: fetchAllStats,
    };
}
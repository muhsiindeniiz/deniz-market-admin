// hooks/useOrders.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Order, OrderStatus } from '@/lib/types';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import toast from 'react-hot-toast';
import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

interface UseOrdersOptions {
  status?: OrderStatus;
  search?: string;
  page?: number;
  dateFrom?: string;
  dateTo?: string;
  enableRealtime?: boolean;
}

const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 1.0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        logger.error('Bildirim sesi çalınamadı:', error);
      });
    }
  } catch (error) {
    logger.error('Audio oluşturma hatası:', error);
  }
};

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const { status, search, page = 1, dateFrom, dateTo, enableRealtime = true } = options;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Tek sorguda tüm ilişkili verileri çek
      let query = supabase
        .from('orders')
        .select(
          `
          *,
          user:users!orders_user_id_fkey (
            id,
            email,
            full_name,
            phone,
            birth_date
          ),
          items:order_items (
            id,
            order_id,
            product_id,
            quantity,
            price,
            discount_price,
            product:products (
              id,
              name,
              images,
              unit
            )
          )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.ilike('order_number', `%${search}%`);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Orders fetch error:', error);
        throw error;
      }

      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      logger.error('Error fetching orders:', error);
      toast.error('Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [status, search, page, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime subscription for orders
  useEffect(() => {
    if (!enableRealtime) return;

    logger.log('Setting up orders list realtime subscription...');

    const channel = supabase.channel('orders-list-channel', {
      config: {
        broadcast: { self: true },
      },
    });

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          logger.log('Orders list change received:', payload);

          if (payload.eventType === 'INSERT') {
            // Fetch the complete order with relations
            const { data: newOrder, error } = await supabase
              .from('orders')
              .select(
                `
                *,
                user:users!orders_user_id_fkey (
                  id,
                  email,
                  full_name,
                  phone,
                  birth_date
                ),
                items:order_items (
                  id,
                  order_id,
                  product_id,
                  quantity,
                  price,
                  discount_price,
                  product:products (
                    id,
                    name,
                    images,
                    unit
                  )
                )
              `
              )
              .eq('id', payload.new.id)
              .single();

            if (error) {
              logger.error('Error fetching new order:', error);
              return;
            }

            if (newOrder) {
              logger.log('Fetched new order with relations:', newOrder);

              // Yeni sipariş geldiğinde bildirim sesi çal
              playNotificationSound();

              // Only add to list if on first page and no filters
              if (page === 1 && !status && !search) {
                setOrders((prev) => [newOrder, ...prev.slice(0, ITEMS_PER_PAGE - 1)]);
                setTotalCount((prev) => prev + 1);
              } else {
                // Just update the count
                setTotalCount((prev) => prev + 1);
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            logger.log('Order UPDATE received:', payload);
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id ? { ...order, ...payload.new } : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            logger.log('Order DELETE received:', payload);
            setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
            setTotalCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status, err) => {
        logger.log('Orders list realtime subscription status:', status);
        if (err) {
          logger.error('Orders list realtime subscription error:', err);
        }
        if (status === 'SUBSCRIBED') {
          logger.log('Successfully subscribed to orders list realtime!');
        }
      });

    channelRef.current = channel;

    return () => {
      logger.log('Cleaning up orders list realtime subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [enableRealtime, page, status, search]);

  const getOrder = async (id: string): Promise<Order | null> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          user:users!orders_user_id_fkey (
            id,
            email,
            full_name,
            phone,
            birth_date
          ),
          items:order_items (
            id,
            order_id,
            product_id,
            quantity,
            price,
            discount_price,
            product:products (
              id,
              name,
              description,
              images,
              unit,
              price,
              discount_price
            )
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching order:', error);
      return null;
    }
  };

  const updateOrderStatus = async (id: string, newStatus: OrderStatus): Promise<boolean> => {
    try {
      // Önce mevcut siparişin durumunu ve ürünlerini al
      const currentOrder = orders.find((o) => o.id === id);
      const previousStatus = currentOrder?.status;

      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Sipariş pending'den processing'e geçtiğinde stokları düşür
      if (previousStatus === 'pending' && newStatus === 'processing' && currentOrder?.items) {
        for (const item of currentOrder.items) {
          if (item.product_id) {
            const { error: stockError } = await supabase.rpc('decrement_stock', {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            });

            // RPC fonksiyonu yoksa direkt update yap
            if (stockError) {
              const { data: product } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.product_id)
                .single();

              if (product) {
                await supabase
                  .from('products')
                  .update({ stock: Math.max(0, product.stock - item.quantity) })
                  .eq('id', item.product_id);
              }
            }
          }
        }
      }

      // Sipariş iptal edildiğinde stokları geri ekle (eğer daha önce processing veya sonrası ise)
      if (
        newStatus === 'cancelled' &&
        previousStatus &&
        ['processing', 'preparing', 'on_delivery'].includes(previousStatus) &&
        currentOrder?.items
      ) {
        for (const item of currentOrder.items) {
          if (item.product_id) {
            const { data: product } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single();

            if (product) {
              await supabase
                .from('products')
                .update({ stock: product.stock + item.quantity })
                .eq('id', item.product_id);
            }
          }
        }
      }

      // Lokal state'i güncelle (yeniden fetch etmeden)
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
      );

      toast.success('Sipariş durumu güncellendi');
      return true;
    } catch (error) {
      logger.error('Error updating order status:', error);
      toast.error('Sipariş durumu güncellenirken hata oluştu');
      return false;
    }
  };

  const bulkUpdateStatus = async (ids: string[], newStatus: OrderStatus): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (error) throw error;

      // State'i hemen güncelle
      setOrders((prev) =>
        prev.map((order) => (ids.includes(order.id) ? { ...order, status: newStatus } : order))
      );

      toast.success(`${ids.length} siparişin durumu güncellendi`);
      return true;
    } catch (error) {
      logger.error('Error bulk updating order status:', error);
      toast.error('Sipariş durumları güncellenirken hata oluştu');
      return false;
    }
  };

  const bulkDeleteOrders = async (ids: string[]): Promise<boolean> => {
    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', ids);

      if (itemsError) throw itemsError;

      // Then delete orders
      const { error } = await supabase.from('orders').delete().in('id', ids);

      if (error) throw error;

      // State'i hemen güncelle
      setOrders((prev) => prev.filter((order) => !ids.includes(order.id)));
      setTotalCount((prev) => prev - ids.length);

      toast.success(`${ids.length} sipariş silindi`);
      return true;
    } catch (error) {
      logger.error('Error bulk deleting orders:', error);
      toast.error('Siparişler silinirken hata oluştu');
      return false;
    }
  };

  return {
    orders,
    loading,
    totalCount,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    fetchOrders,
    getOrder,
    updateOrderStatus,
    bulkUpdateStatus,
    bulkDeleteOrders,
  };
}
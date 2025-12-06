// hooks/useCustomers.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User, Address } from '@/lib/types';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import toast from 'react-hot-toast';

export interface CustomerWithDetails extends User {
    addresses?: Address[];
    order_count?: number;
    total_spent?: number;
}

interface UseCustomersOptions {
    search?: string;
    page?: number;
}

export function useCustomers(options: UseCustomersOptions = {}) {
    const [customers, setCustomers] = useState<CustomerWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const { search, page = 1 } = options;

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            // Tek sorguda users ve addresses'i çek
            let query = supabase
                .from('users')
                .select(
                    `
          *,
          addresses (
            id,
            title,
            full_address,
            city,
            district,
            postal_code,
            is_default
          )
        `,
                    { count: 'exact' }
                )
                .order('created_at', { ascending: false });

            if (search) {
                query = query.or(
                    `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
                );
            }

            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            query = query.range(from, to);

            const { data: usersData, error: usersError, count } = await query;

            if (usersError) {
                console.error('Users fetch error:', usersError);
                throw usersError;
            }

            if (!usersData || usersData.length === 0) {
                setCustomers([]);
                setTotalCount(0);
                setLoading(false);
                return;
            }

            // User ID'lerini topla
            const userIds = usersData.map((u) => u.id);

            // Tüm kullanıcıların sipariş istatistiklerini tek sorguda çek
            const { data: orderStats } = await supabase
                .from('orders')
                .select('user_id, total_amount, status')
                .in('user_id', userIds);

            // Sipariş istatistiklerini hesapla
            const statsMap = new Map<string, { order_count: number; total_spent: number }>();

            (orderStats || []).forEach((order) => {
                if (order.status === 'cancelled') return;

                const existing = statsMap.get(order.user_id) || { order_count: 0, total_spent: 0 };
                existing.order_count += 1;
                existing.total_spent += Number(order.total_amount || 0);
                statsMap.set(order.user_id, existing);
            });

            // Kullanıcılara istatistikleri ekle
            const customersWithDetails: CustomerWithDetails[] = usersData.map((user) => {
                const stats = statsMap.get(user.id) || { order_count: 0, total_spent: 0 };
                return {
                    ...user,
                    order_count: stats.order_count,
                    total_spent: stats.total_spent,
                };
            });

            setCustomers(customersWithDetails);
            setTotalCount(count || 0);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Müşteriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const getCustomer = async (id: string): Promise<CustomerWithDetails | null> => {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select(
                    `
          *,
          addresses (*)
        `
                )
                .eq('id', id)
                .single();

            if (error) throw error;

            // Sipariş istatistiklerini çek
            const { data: orderStats } = await supabase
                .from('orders')
                .select('total_amount, status')
                .eq('user_id', id);

            const validOrders = (orderStats || []).filter((o) => o.status !== 'cancelled');

            return {
                ...user,
                order_count: validOrders.length,
                total_spent: validOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
            };
        } catch (error) {
            console.error('Error fetching customer:', error);
            return null;
        }
    };

    const updateCustomer = async (id: string, data: Partial<User>): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: data.full_name,
                    phone: data.phone,
                    birth_date: data.birth_date,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) throw error;

            // State'i hemen güncelle
            setCustomers((prev) =>
                prev.map((c) =>
                    c.id === id
                        ? { ...c, full_name: data.full_name || c.full_name, phone: data.phone ?? c.phone, birth_date: data.birth_date ?? c.birth_date }
                        : c
                )
            );

            toast.success('Müşteri bilgileri güncellendi');
            return true;
        } catch (error) {
            console.error('Error updating customer:', error);
            toast.error('Müşteri güncellenirken hata oluştu');
            return false;
        }
    };

    const deleteCustomer = async (id: string): Promise<boolean> => {
        try {
            // Önce ilişkili siparişleri kontrol et
            const { count } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', id);

            if (count && count > 0) {
                toast.error('Bu müşterinin siparişleri var, silinemez');
                return false;
            }

            // Adresleri sil
            await supabase.from('addresses').delete().eq('user_id', id);

            // Favorileri sil
            await supabase.from('favorites').delete().eq('user_id', id);

            // Bildirimleri sil
            await supabase.from('notifications').delete().eq('user_id', id);

            // Kullanıcıyı sil
            const { error } = await supabase.from('users').delete().eq('id', id);

            if (error) throw error;

            // State'i hemen güncelle
            setCustomers((prev) => prev.filter((c) => c.id !== id));
            setTotalCount((prev) => prev - 1);

            toast.success('Müşteri silindi');
            return true;
        } catch (error) {
            console.error('Error deleting customer:', error);
            toast.error('Müşteri silinirken hata oluştu');
            return false;
        }
    };

    const addAddress = async (userId: string, address: Partial<Address>): Promise<boolean> => {
        try {
            if (address.is_default) {
                await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
            }

            const { data: newAddress, error } = await supabase
                .from('addresses')
                .insert({
                    user_id: userId,
                    title: address.title,
                    full_address: address.full_address,
                    city: address.city,
                    district: address.district,
                    postal_code: address.postal_code || null,
                    is_default: address.is_default || false,
                })
                .select()
                .single();

            if (error) throw error;

            // State'i hemen güncelle
            if (newAddress) {
                setCustomers((prev) =>
                    prev.map((c) => {
                        if (c.id === userId) {
                            const updatedAddresses = address.is_default
                                ? (c.addresses || []).map((a) => ({ ...a, is_default: false }))
                                : c.addresses || [];
                            return { ...c, addresses: [...updatedAddresses, newAddress] };
                        }
                        return c;
                    })
                );
            }

            toast.success('Adres eklendi');
            return true;
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('Adres eklenirken hata oluştu');
            return false;
        }
    };

    const updateAddress = async (
        addressId: string,
        userId: string,
        data: Partial<Address>
    ): Promise<boolean> => {
        try {
            if (data.is_default) {
                await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
            }

            const { data: updatedAddress, error } = await supabase
                .from('addresses')
                .update({
                    title: data.title,
                    full_address: data.full_address,
                    city: data.city,
                    district: data.district,
                    postal_code: data.postal_code || null,
                    is_default: data.is_default || false,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', addressId)
                .select()
                .single();

            if (error) throw error;

            // State'i hemen güncelle
            if (updatedAddress) {
                setCustomers((prev) =>
                    prev.map((c) => {
                        if (c.id === userId) {
                            const updatedAddresses = (c.addresses || []).map((a) => {
                                if (a.id === addressId) return updatedAddress;
                                if (data.is_default) return { ...a, is_default: false };
                                return a;
                            });
                            return { ...c, addresses: updatedAddresses };
                        }
                        return c;
                    })
                );
            }

            toast.success('Adres güncellendi');
            return true;
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Adres güncellenirken hata oluştu');
            return false;
        }
    };

    const deleteAddress = async (addressId: string, userId: string): Promise<boolean> => {
        try {
            const { error } = await supabase.from('addresses').delete().eq('id', addressId);

            if (error) throw error;

            // State'i hemen güncelle
            setCustomers((prev) =>
                prev.map((c) => {
                    if (c.id === userId) {
                        return { ...c, addresses: (c.addresses || []).filter((a) => a.id !== addressId) };
                    }
                    return c;
                })
            );

            toast.success('Adres silindi');
            return true;
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Adres silinirken hata oluştu');
            return false;
        }
    };

    return {
        customers,
        loading,
        totalCount,
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
        fetchCustomers,
        getCustomer,
        updateCustomer,
        deleteCustomer,
        addAddress,
        updateAddress,
        deleteAddress,
    };
}
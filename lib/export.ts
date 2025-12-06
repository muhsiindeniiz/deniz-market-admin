// lib/export.ts
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from '@/lib/constants';

type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  format: ExportFormat;
  dateFrom?: string;
  dateTo?: string;
}

// Helper function to convert data to CSV
function convertToCSV(data: Record<string, unknown>[], headers: { key: string; label: string }[]): string {
  if (data.length === 0) return '';

  const headerRow = headers.map((h) => `"${h.label}"`).join(',');
  const rows = data.map((item) =>
    headers
      .map((h) => {
        const value = item[h.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return `"${value}"`;
      })
      .join(',')
  );

  return [headerRow, ...rows].join('\n');
}

// Helper function to download file
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Products
export async function exportProducts(options: ExportOptions): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name), store:stores(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const products = (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      discount_price: p.discount_price || '',
      stock: p.stock,
      unit: p.unit || '',
      category: p.category?.name || '',
      store: p.store?.name || '',
      is_featured: p.is_featured ? 'Evet' : 'Hayır',
      is_on_sale: p.is_on_sale ? 'Evet' : 'Hayır',
      created_at: formatDate(p.created_at),
    }));

    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Ürün Adı' },
      { key: 'description', label: 'Açıklama' },
      { key: 'price', label: 'Fiyat' },
      { key: 'discount_price', label: 'İndirimli Fiyat' },
      { key: 'stock', label: 'Stok' },
      { key: 'unit', label: 'Birim' },
      { key: 'category', label: 'Kategori' },
      { key: 'store', label: 'Mağaza' },
      { key: 'is_featured', label: 'Öne Çıkan' },
      { key: 'is_on_sale', label: 'İndirimde' },
      { key: 'created_at', label: 'Oluşturma Tarihi' },
    ];

    const timestamp = new Date().toISOString().split('T')[0];

    if (options.format === 'csv') {
      const csv = convertToCSV(products, headers);
      downloadFile(csv, `urunler_${timestamp}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const json = JSON.stringify(products, null, 2);
      downloadFile(json, `urunler_${timestamp}.json`, 'application/json');
    }

    return true;
  } catch (error) {
    console.error('Error exporting products:', error);
    return false;
  }
}

// Export Orders
export async function exportOrders(options: ExportOptions): Promise<boolean> {
  try {
    let query = supabase
      .from('orders')
      .select(
        `
        *,
        user:users!orders_user_id_fkey(full_name, email, phone),
        items:order_items(quantity, price, product:products(name))
      `
      )
      .order('created_at', { ascending: false });

    if (options.dateFrom) {
      query = query.gte('created_at', options.dateFrom);
    }
    if (options.dateTo) {
      query = query.lte('created_at', options.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    const orders = (data || []).map((o) => ({
      order_number: o.order_number,
      customer_name: o.user?.full_name || '',
      customer_email: o.user?.email || '',
      customer_phone: o.user?.phone || '',
      status: ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] || o.status,
      payment_method: PAYMENT_METHOD_LABELS[o.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || o.payment_method,
      subtotal: o.subtotal,
      delivery_fee: o.delivery_fee,
      discount: o.discount,
      total_amount: o.total_amount,
      item_count: o.items?.length || 0,
      items_detail: o.items?.map((i: { product?: { name: string }; quantity: number }) => `${i.product?.name || ''} (${i.quantity})`).join(', ') || '',
      delivery_address: o.delivery_address || '',
      delivery_note: o.delivery_note || '',
      created_at: formatDate(o.created_at),
    }));

    const headers = [
      { key: 'order_number', label: 'Sipariş No' },
      { key: 'customer_name', label: 'Müşteri Adı' },
      { key: 'customer_email', label: 'E-posta' },
      { key: 'customer_phone', label: 'Telefon' },
      { key: 'status', label: 'Durum' },
      { key: 'payment_method', label: 'Ödeme Yöntemi' },
      { key: 'subtotal', label: 'Ara Toplam' },
      { key: 'delivery_fee', label: 'Kargo Ücreti' },
      { key: 'discount', label: 'İndirim' },
      { key: 'total_amount', label: 'Toplam Tutar' },
      { key: 'item_count', label: 'Ürün Sayısı' },
      { key: 'items_detail', label: 'Ürünler' },
      { key: 'delivery_address', label: 'Teslimat Adresi' },
      { key: 'delivery_note', label: 'Teslimat Notu' },
      { key: 'created_at', label: 'Sipariş Tarihi' },
    ];

    const timestamp = new Date().toISOString().split('T')[0];

    if (options.format === 'csv') {
      const csv = convertToCSV(orders, headers);
      downloadFile(csv, `siparisler_${timestamp}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const json = JSON.stringify(orders, null, 2);
      downloadFile(json, `siparisler_${timestamp}.json`, 'application/json');
    }

    return true;
  } catch (error) {
    console.error('Error exporting orders:', error);
    return false;
  }
}

// Export Customers
export async function exportCustomers(options: ExportOptions): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get order stats for each customer
    const { data: orderStats } = await supabase
      .from('orders')
      .select('user_id, total_amount')
      .eq('status', 'delivered');

    const customerOrderStats: Record<string, { count: number; total: number }> = {};
    (orderStats || []).forEach((o) => {
      if (!customerOrderStats[o.user_id]) {
        customerOrderStats[o.user_id] = { count: 0, total: 0 };
      }
      customerOrderStats[o.user_id].count++;
      customerOrderStats[o.user_id].total += o.total_amount;
    });

    const customers = (data || []).map((c) => ({
      id: c.id,
      full_name: c.full_name || '',
      email: c.email,
      phone: c.phone || '',
      birth_date: c.birth_date || '',
      total_orders: customerOrderStats[c.id]?.count || 0,
      total_spent: customerOrderStats[c.id]?.total || 0,
      created_at: formatDate(c.created_at),
    }));

    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'full_name', label: 'Ad Soyad' },
      { key: 'email', label: 'E-posta' },
      { key: 'phone', label: 'Telefon' },
      { key: 'birth_date', label: 'Doğum Tarihi' },
      { key: 'total_orders', label: 'Toplam Sipariş' },
      { key: 'total_spent', label: 'Toplam Harcama' },
      { key: 'created_at', label: 'Kayıt Tarihi' },
    ];

    const timestamp = new Date().toISOString().split('T')[0];

    if (options.format === 'csv') {
      const csv = convertToCSV(customers, headers);
      downloadFile(csv, `musteriler_${timestamp}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const json = JSON.stringify(customers, null, 2);
      downloadFile(json, `musteriler_${timestamp}.json`, 'application/json');
    }

    return true;
  } catch (error) {
    console.error('Error exporting customers:', error);
    return false;
  }
}

// Export Categories
export async function exportCategories(options: ExportOptions): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const categories = (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      item_count: c.item_count || 0,
      sort_order: c.sort_order,
      is_active: c.is_active ? 'Evet' : 'Hayır',
      created_at: formatDate(c.created_at),
    }));

    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Kategori Adı' },
      { key: 'description', label: 'Açıklama' },
      { key: 'item_count', label: 'Ürün Sayısı' },
      { key: 'sort_order', label: 'Sıralama' },
      { key: 'is_active', label: 'Aktif' },
      { key: 'created_at', label: 'Oluşturma Tarihi' },
    ];

    const timestamp = new Date().toISOString().split('T')[0];

    if (options.format === 'csv') {
      const csv = convertToCSV(categories, headers);
      downloadFile(csv, `kategoriler_${timestamp}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const json = JSON.stringify(categories, null, 2);
      downloadFile(json, `kategoriler_${timestamp}.json`, 'application/json');
    }

    return true;
  } catch (error) {
    console.error('Error exporting categories:', error);
    return false;
  }
}

// Export Reviews
export async function exportReviews(options: ExportOptions): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        user:users(full_name, email),
        product:products(name)
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    const reviews = (data || []).map((r) => ({
      id: r.id,
      product_name: r.product?.name || '',
      customer_name: r.user?.full_name || '',
      customer_email: r.user?.email || '',
      rating: r.rating,
      comment: r.comment || '',
      created_at: formatDate(r.created_at),
    }));

    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'product_name', label: 'Ürün Adı' },
      { key: 'customer_name', label: 'Müşteri Adı' },
      { key: 'customer_email', label: 'E-posta' },
      { key: 'rating', label: 'Puan' },
      { key: 'comment', label: 'Yorum' },
      { key: 'created_at', label: 'Tarih' },
    ];

    const timestamp = new Date().toISOString().split('T')[0];

    if (options.format === 'csv') {
      const csv = convertToCSV(reviews, headers);
      downloadFile(csv, `degerlendirmeler_${timestamp}.csv`, 'text/csv;charset=utf-8;');
    } else {
      const json = JSON.stringify(reviews, null, 2);
      downloadFile(json, `degerlendirmeler_${timestamp}.json`, 'application/json');
    }

    return true;
  } catch (error) {
    console.error('Error exporting reviews:', error);
    return false;
  }
}

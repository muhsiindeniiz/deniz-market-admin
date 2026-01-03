// lib/constants.ts
export const COLORS = {
  primary: '#00AA55',
  secondary: '#53D62B',
  warning: '#FFC007',
  danger: '#FE4842',
  info: '#1990FF',
  yellow: '#F3B500',
  dark: '#212B36',
  gray: '#637381',
  white: '#FFFFFF',
  background: '#F5F5F5',
  light: '#ECF0F1',
  success: '#27AE60',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Sipariş Alındı',
  processing: 'Hazırlanıyor',
  preparing: 'Paketleniyor',
  on_delivery: 'Yolda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  on_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Nakit',
  card: 'Kredi Kartı',
};

export const STORAGE_BUCKETS = {
  CATEGORIES: 'categories',
  PRODUCTS: 'product-images',
  PROMOS: 'promos',
  STORES: 'stores',
  CAMPAIGNS: 'campaigns',
} as const;

export const ITEMS_PER_PAGE = 10;

export const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  flash_sale: 'Anlık Fırsat',
  weekend: 'Hafta Sonu',
  min_cart: 'Minimum Sepet',
  brand: 'Marka Kampanyası',
  birthday: 'Doğum Günü',
  category: 'Kategori İndirimi',
  product: 'Ürün İndirimi',
  first_order: 'İlk Sipariş',
  free_delivery: 'Ücretsiz Kargo',
};

export const CAMPAIGN_TYPE_COLORS: Record<string, string> = {
  flash_sale: 'bg-red-100 text-red-800',
  weekend: 'bg-purple-100 text-purple-800',
  min_cart: 'bg-green-100 text-green-800',
  brand: 'bg-amber-100 text-amber-800',
  birthday: 'bg-pink-100 text-pink-800',
  category: 'bg-blue-100 text-blue-800',
  product: 'bg-indigo-100 text-indigo-800',
  first_order: 'bg-cyan-100 text-cyan-800',
  free_delivery: 'bg-sky-100 text-sky-800',
};

export const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  percentage: 'Yüzde İndirim',
  fixed: 'Sabit Tutar',
  free_delivery: 'Ücretsiz Kargo',
};

export const DAY_LABELS: Record<number, string> = {
  0: 'Pazar',
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
};

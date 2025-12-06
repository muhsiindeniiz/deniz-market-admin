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
  processing: 'İşleniyor',
  preparing: 'Hazırlanıyor',
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
} as const;

export const ITEMS_PER_PAGE = 10;

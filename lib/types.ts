export interface Promo {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  image_url: string;
  gradient_start: string;
  gradient_end: string;
  link_type: 'category' | 'product' | 'store' | 'external';
  link_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  item_count: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  category_id: string | null;
  images: string[];
  stock: number;
  unit: string;
  weight: string | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_on_sale: boolean;
  store_id: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  store?: Store;
}

export interface Store {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  banner_image: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  title: string;
  full_address: string;
  city: string;
  district: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  delivery_fee: number;
  discount_amount: number;
  payment_method: 'cash' | 'card';
  delivery_address: Address;
  delivery_time: string | null;
  delivery_note: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  user?: User;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'preparing'
  | 'on_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  discount_price: number | null;
  created_at: string;
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: User;
  product?: Product;
  order?: {
    id: string;
    order_number: string;
    items?: {
      id: string;
      product_id: string | null;
      quantity: number;
      product?: Pick<Product, 'id' | 'name' | 'images'> | null;
    }[];
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'general';
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface TermsAndConditions {
  id: string;
  content: string;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrivacyPolicy {
  id: string;
  content: string;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items?: FAQItem[];
}

export interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  id: string;
  type: 'phone' | 'email' | 'whatsapp' | 'address';
  label: string;
  value: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  id: string;
  day_label: string;
  hours: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  weeklyOrders: number;
  weeklyRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
}

export interface CategoryStat {
  category_id: string;
  category_name: string;
  order_count: number;
  total_revenue: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_sold: number;
  total_revenue: number;
  image: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  value_type: 'string' | 'number' | 'boolean' | 'json';
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginBenefit {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  badge: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithStats extends User {
  order_count: number;
  total_spent: number;
  addresses?: Address[];
}

export interface AnalyticsData {
  revenue: {
    total: number;
    today: number;
    week: number;
    month: number;
    previousMonth: number;
    growth: number;
  };
  orders: {
    total: number;
    today: number;
    week: number;
    month: number;
    pending: number;
    completed: number;
    cancelled: number;
    averageValue: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    activeThisMonth: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
    featured: number;
    onSale: number;
  };
  favorites: {
    total: number;
    topProducts: Array<{
      product_id: string;
      product_name: string;
      favorite_count: number;
      image: string;
    }>;
  };
}

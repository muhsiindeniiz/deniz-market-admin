// OneSignal REST API configuration
export const ONESIGNAL_APP_ID = 'd73de158-b0c3-48c1-a904-d7cd18b52c9f';

// Notification icon options
export type NotificationIcon =
  | 'default'
  | 'shopping_cart'
  | 'discount'
  | 'announcement'
  | 'info'
  | 'warning'
  | 'success';

// Android notification channel importance
export type AndroidChannelImportance = 'low' | 'default' | 'high' | 'urgent';

// iOS interruption level
export type IOSInterruptionLevel = 'passive' | 'active' | 'time_sensitive' | 'critical';

// Action button for notification
export interface NotificationActionButton {
  id: string;
  text: string;
  icon?: string;
  launch_url?: string;
}

export interface OneSignalNotificationPayload {
  // Required
  title: string;
  message: string;

  // Target options
  include_external_user_ids?: string[];
  included_segments?: string[];

  // Custom data
  data?: Record<string, unknown>;

  // Appearance - Icons
  small_icon?: string; // Android small icon (status bar)
  large_icon?: string; // Android large icon (notification drawer)
  ios_badge_type?: 'None' | 'SetTo' | 'Increase';
  ios_badge_count?: number;

  // Appearance - Images
  big_picture?: string; // Android big picture URL
  ios_attachments?: Record<string, string>; // iOS media attachments

  // Appearance - Colors
  android_accent_color?: string; // Android accent color (ARGB hex, e.g., "FF00FF00")

  // Sound
  android_sound?: string; // Android sound file name
  ios_sound?: string; // iOS sound file name

  // Priority & Importance
  priority?: number; // Android priority (0-10)
  android_channel_id?: string; // Android notification channel
  ios_interruption_level?: IOSInterruptionLevel;

  // Behavior
  ttl?: number; // Time to live in seconds
  collapse_id?: string; // Replace notifications with same collapse_id

  // URLs & Actions
  url?: string; // URL to open on click
  web_url?: string; // Web URL
  app_url?: string; // Deep link URL
  action_buttons?: NotificationActionButton[];

  // Scheduling
  send_after?: string; // ISO 8601 datetime
  delayed_option?: 'timezone' | 'last-active';
  delivery_time_of_day?: string; // "9:00AM"

  // Grouping
  android_group?: string; // Android notification group key
  thread_id?: string; // iOS thread identifier
  summary_arg?: string; // iOS summary argument
  summary_arg_count?: number;
}

export interface OneSignalResponse {
  id?: string;
  recipients?: number;
  errors?: string[];
}

// Default notification settings
export const DEFAULT_NOTIFICATION_SETTINGS = {
  small_icon: 'ic_notification', // Your app's notification icon
  android_accent_color: 'FF4CAF50', // Green color matching your brand
  ios_badge_type: 'Increase' as const,
  ios_badge_count: 1,
  priority: 10,
  ttl: 259200, // 3 days
};

// Predefined icon mappings (these should match icons in your mobile app)
export const NOTIFICATION_ICONS: Record<NotificationIcon, { small: string; large: string; description: string }> = {
  default: {
    small: 'ic_notification',
    large: 'ic_launcher',
    description: 'Varsayilan',
  },
  shopping_cart: {
    small: 'ic_shopping_cart',
    large: 'ic_shopping_cart_large',
    description: 'Alisveris Sepeti',
  },
  discount: {
    small: 'ic_discount',
    large: 'ic_discount_large',
    description: 'Indirim',
  },
  announcement: {
    small: 'ic_announcement',
    large: 'ic_announcement_large',
    description: 'Duyuru',
  },
  info: {
    small: 'ic_info',
    large: 'ic_info_large',
    description: 'Bilgi',
  },
  warning: {
    small: 'ic_warning',
    large: 'ic_warning_large',
    description: 'Uyari',
  },
  success: {
    small: 'ic_success',
    large: 'ic_success_large',
    description: 'Basarili',
  },
};

// Predefined accent colors
export const NOTIFICATION_COLORS: Record<string, { hex: string; name: string }> = {
  green: { hex: 'FF4CAF50', name: 'Yesil (Varsayilan)' },
  blue: { hex: 'FF2196F3', name: 'Mavi' },
  red: { hex: 'FFF44336', name: 'Kirmizi' },
  orange: { hex: 'FFFF9800', name: 'Turuncu' },
  purple: { hex: 'FF9C27B0', name: 'Mor' },
  teal: { hex: 'FF009688', name: 'Turkuaz' },
  pink: { hex: 'FFE91E63', name: 'Pembe' },
};

// Priority levels with descriptions
export const PRIORITY_LEVELS = [
  { value: 10, label: 'Acil', description: 'Hemen gosterilir, ses ve titresim' },
  { value: 7, label: 'Yuksek', description: 'Ses ile birlikte gosterilir' },
  { value: 5, label: 'Normal', description: 'Standart bildirim' },
  { value: 3, label: 'Dusuk', description: 'Sessiz bildirim' },
  { value: 1, label: 'Minimum', description: 'Sadece bildirim cekmecesinde' },
];

// iOS interruption levels with descriptions
export const IOS_INTERRUPTION_LEVELS = [
  { value: 'passive' as IOSInterruptionLevel, label: 'Pasif', description: 'Sessiz, bildirim merkezinde gosterilir' },
  { value: 'active' as IOSInterruptionLevel, label: 'Aktif', description: 'Ses ve titresim ile birlikte' },
  { value: 'time_sensitive' as IOSInterruptionLevel, label: 'Zaman Hassas', description: 'Odaklanma modunu gecer' },
  { value: 'critical' as IOSInterruptionLevel, label: 'Kritik', description: 'Ses kapatilmis olsa bile calar' },
];

// Client-side function to call our API route
export async function sendPushNotification(
  payload: OneSignalNotificationPayload
): Promise<OneSignalResponse> {
  try {
    const response = await fetch('/api/onesignal/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send push notification');
    }

    return data;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

// Cancel/delete a notification from OneSignal
export async function cancelPushNotification(notificationId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('/api/onesignal/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notification_id: notificationId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to cancel push notification');
    }

    return data;
  } catch (error) {
    console.error('Error cancelling push notification:', error);
    throw error;
  }
}

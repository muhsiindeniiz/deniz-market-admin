'use client';

import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface IconRendererProps {
  icon: string;
  className?: string;
  size?: number;
  color?: string;
}

// Ionicons -> Lucide icon mapping
const iconMap: Record<string, keyof typeof LucideIcons> = {
  // Common Ionicons to Lucide mappings
  'shield-checkmark': 'ShieldCheck',
  'shield-checkmark-outline': 'ShieldCheck',
  'gift': 'Gift',
  'gift-outline': 'Gift',
  'card': 'CreditCard',
  'card-outline': 'CreditCard',
  'cart': 'ShoppingCart',
  'cart-outline': 'ShoppingCart',
  'heart': 'Heart',
  'heart-outline': 'Heart',
  'star': 'Star',
  'star-outline': 'Star',
  'notifications': 'Bell',
  'notifications-outline': 'Bell',
  'person': 'User',
  'person-outline': 'User',
  'home': 'Home',
  'home-outline': 'Home',
  'settings': 'Settings',
  'settings-outline': 'Settings',
  'close': 'X',
  'close-outline': 'X',
  'checkmark': 'Check',
  'checkmark-outline': 'Check',
  'checkmark-circle': 'CheckCircle',
  'checkmark-circle-outline': 'CheckCircle',
  'add': 'Plus',
  'add-outline': 'Plus',
  'remove': 'Minus',
  'remove-outline': 'Minus',
  'trash': 'Trash2',
  'trash-outline': 'Trash2',
  'create': 'Pencil',
  'create-outline': 'Pencil',
  'search': 'Search',
  'search-outline': 'Search',
  'mail': 'Mail',
  'mail-outline': 'Mail',
  'call': 'Phone',
  'call-outline': 'Phone',
  'location': 'MapPin',
  'location-outline': 'MapPin',
  'time': 'Clock',
  'time-outline': 'Clock',
  'calendar': 'Calendar',
  'calendar-outline': 'Calendar',
  'document': 'FileText',
  'document-outline': 'FileText',
  'wallet': 'Wallet',
  'wallet-outline': 'Wallet',
  'pricetag': 'Tag',
  'pricetag-outline': 'Tag',
  'bag': 'ShoppingBag',
  'bag-outline': 'ShoppingBag',
  'cube': 'Package',
  'cube-outline': 'Package',
  'car': 'Car',
  'car-outline': 'Car',
  'bicycle': 'Bike',
  'bicycle-outline': 'Bike',
  'rocket': 'Rocket',
  'rocket-outline': 'Rocket',
  'flash': 'Zap',
  'flash-outline': 'Zap',
  'sparkles': 'Sparkles',
  'sparkles-outline': 'Sparkles',
  'trending-up': 'TrendingUp',
  'trending-up-outline': 'TrendingUp',
  'trending-down': 'TrendingDown',
  'trending-down-outline': 'TrendingDown',
  'ribbon': 'Award',
  'ribbon-outline': 'Award',
  'trophy': 'Trophy',
  'trophy-outline': 'Trophy',
  'medal': 'Medal',
  'medal-outline': 'Medal',
  'percent': 'Percent',
  'percent-outline': 'Percent',
  'cash': 'Banknote',
  'cash-outline': 'Banknote',
  'lock-closed': 'Lock',
  'lock-closed-outline': 'Lock',
  'lock-open': 'Unlock',
  'lock-open-outline': 'Unlock',
  'eye': 'Eye',
  'eye-outline': 'Eye',
  'eye-off': 'EyeOff',
  'eye-off-outline': 'EyeOff',
  'refresh': 'RefreshCw',
  'refresh-outline': 'RefreshCw',
  'sync': 'RefreshCcw',
  'sync-outline': 'RefreshCcw',
  'information-circle': 'Info',
  'information-circle-outline': 'Info',
  'warning': 'AlertTriangle',
  'warning-outline': 'AlertTriangle',
  'alert-circle': 'AlertCircle',
  'alert-circle-outline': 'AlertCircle',
  'help-circle': 'HelpCircle',
  'help-circle-outline': 'HelpCircle',
  'chatbubble': 'MessageCircle',
  'chatbubble-outline': 'MessageCircle',
  'chatbubbles': 'MessageSquare',
  'chatbubbles-outline': 'MessageSquare',
  'thumbs-up': 'ThumbsUp',
  'thumbs-up-outline': 'ThumbsUp',
  'thumbs-down': 'ThumbsDown',
  'thumbs-down-outline': 'ThumbsDown',
  'happy': 'Smile',
  'happy-outline': 'Smile',
  'sad': 'Frown',
  'sad-outline': 'Frown',
};

// Check if a string is an emoji (simplified check)
function isEmoji(str: string): boolean {
  const emojiRegex = /^[\p{Emoji}]+$/u;
  return emojiRegex.test(str) && str.length <= 4;
}

// Convert kebab-case to PascalCase
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function IconRenderer({ icon, className = '', size = 24, color }: IconRendererProps) {
  // If it's an emoji, render it directly
  if (isEmoji(icon)) {
    return (
      <span className={className} style={{ fontSize: size, lineHeight: 1 }}>
        {icon}
      </span>
    );
  }

  // Try to find the icon in our mapping first
  let iconName = iconMap[icon.toLowerCase()];

  // If not in mapping, try to convert to PascalCase and find directly
  if (!iconName) {
    iconName = toPascalCase(icon) as keyof typeof LucideIcons;
  }

  // Get the icon component from Lucide
  const IconComponent = LucideIcons[iconName] as React.FC<LucideProps>;

  if (IconComponent) {
    return <IconComponent className={className} size={size} color={color} />;
  }

  // Fallback: render the icon string as text (emoji or icon name)
  return (
    <span className={className} style={{ fontSize: size * 0.8, lineHeight: 1 }}>
      {icon}
    </span>
  );
}

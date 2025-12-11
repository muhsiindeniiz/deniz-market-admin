// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}

export function formatDate(date: string): string {
  // Intl yerine manuel format kullanarak hydration uyumsuzluğunu önle
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function formatDateShort(date: string): string {
  // Intl yerine manuel format kullanarak hydration uyumsuzluğunu önle
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DM-${timestamp}-${random}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatDeliveryTime(time: string): string {
  // "14-16" veya "09:00 - 12:00" formatlarını destekle
  const simpleMatch = time.match(/^(\d{1,2})-(\d{1,2})$/);
  const detailedMatch = time.match(/(\d{1,2}):(\d{2})/);

  let startHour: number;

  if (simpleMatch) {
    // "14-16" formatı
    startHour = parseInt(simpleMatch[1], 10);
    const endHour = parseInt(simpleMatch[2], 10);
    const formattedTime = `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`;

    if (startHour < 12) {
      return `${formattedTime} (Sabah)`;
    } else if (startHour < 18) {
      return `${formattedTime} (Öğleden Sonra)`;
    } else {
      return `${formattedTime} (Akşam)`;
    }
  } else if (detailedMatch) {
    // "09:00 - 12:00" formatı
    startHour = parseInt(detailedMatch[1], 10);
    if (startHour < 12) {
      return `${time} (Sabah)`;
    } else if (startHour < 18) {
      return `${time} (Öğleden Sonra)`;
    } else {
      return `${time} (Akşam)`;
    }
  }

  return time;
}

export function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // /storage/v1/object/public/bucket-name/path şeklinde
    const bucketIndex = pathParts.indexOf('public');
    if (bucketIndex !== -1 && bucketIndex + 2 < pathParts.length) {
      return pathParts.slice(bucketIndex + 2).join('/');
    }
    return null;
  } catch {
    return null;
  }
}

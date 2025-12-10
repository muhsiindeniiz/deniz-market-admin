// lib/rateLimit.ts
// Client-side rate limiting for login attempts

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil: number | null;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 dakika
const MAX_ATTEMPTS = 5; // 15 dakikada maksimum 5 deneme
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 dakika engelleme

// Memory-based rate limit store (client-side)
const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil: Date | null;
  message: string;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Eğer engellenmiş ve süre dolmamışsa
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    const remainingMinutes = Math.ceil((entry.blockedUntil - now) / 60000);
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: new Date(entry.blockedUntil),
      message: `Çok fazla başarısız deneme. ${remainingMinutes} dakika sonra tekrar deneyin.`,
    };
  }

  // Engelleme süresi dolduysa veya entry yoksa
  if (!entry || (entry.blockedUntil && entry.blockedUntil <= now)) {
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      blockedUntil: null,
      message: '',
    };
  }

  // Window süresi dolduysa reset
  if (now - entry.firstAttempt > WINDOW_MS) {
    rateLimitStore.delete(identifier);
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      blockedUntil: null,
      message: '',
    };
  }

  const remainingAttempts = MAX_ATTEMPTS - entry.count;
  return {
    allowed: remainingAttempts > 0,
    remainingAttempts: Math.max(0, remainingAttempts),
    blockedUntil: null,
    message: remainingAttempts <= 0 ? 'Çok fazla başarısız deneme.' : '',
  };
}

export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    // Yeni entry oluştur
    rateLimitStore.set(identifier, {
      count: 1,
      firstAttempt: now,
      blockedUntil: null,
    });
    return;
  }

  const newCount = entry.count + 1;

  if (newCount >= MAX_ATTEMPTS) {
    // Engelle
    rateLimitStore.set(identifier, {
      ...entry,
      count: newCount,
      blockedUntil: now + BLOCK_DURATION_MS,
    });
  } else {
    rateLimitStore.set(identifier, {
      ...entry,
      count: newCount,
    });
  }
}

export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

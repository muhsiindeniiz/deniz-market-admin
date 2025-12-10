'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Store, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rateLimit';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    allowed: boolean;
    remainingAttempts: number;
    blockedUntil: Date | null;
    message: string;
  }>({ allowed: true, remainingAttempts: 5, blockedUntil: null, message: '' });

  // Rate limit durumunu kontrol et
  useEffect(() => {
    if (email) {
      const result = checkRateLimit(email);
      setRateLimitInfo(result);
    }
  }, [email]);

  // Engelleme süresini takip et
  useEffect(() => {
    if (rateLimitInfo.blockedUntil) {
      const interval = setInterval(() => {
        const result = checkRateLimit(email);
        setRateLimitInfo(result);
        if (result.allowed) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [rateLimitInfo.blockedUntil, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limit kontrolü
    const limitCheck = checkRateLimit(email);
    if (!limitCheck.allowed) {
      toast.error(limitCheck.message);
      setRateLimitInfo(limitCheck);
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      resetRateLimit(email); // Başarılı girişte rate limit'i sıfırla
      toast.success('Giriş başarılı');
      router.push('/dashboard');
    } catch (error: unknown) {
      recordFailedAttempt(email);
      const updatedLimit = checkRateLimit(email);
      setRateLimitInfo(updatedLimit);

      const errorMessage = error instanceof Error ? error.message : 'Giriş başarısız';
      if (updatedLimit.remainingAttempts > 0) {
        toast.error(`${errorMessage}. ${updatedLimit.remainingAttempts} deneme hakkınız kaldı.`);
      } else {
        toast.error(updatedLimit.message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-xl mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Deniz Market</h1>
          <p className="text-gray-500 mt-1">Yönetim Paneli</p>
        </div>
        {!rateLimitInfo.allowed && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 font-medium">Hesap Geçici Olarak Kilitlendi</p>
              <p className="text-sm text-red-600 mt-1">{rateLimitInfo.message}</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@denizmarket.com"
            disabled={!rateLimitInfo.allowed}
          />
          <Input
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={!rateLimitInfo.allowed}
          />
          <Button
            type="submit"
            className="w-full"
            loading={loading || isLoading}
            disabled={!rateLimitInfo.allowed}
          >
            Giriş Yap
          </Button>
        </form>
      </Card>
    </div>
  );
}

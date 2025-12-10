'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Loading } from '@/components/ui/Loading';
import { OrderNotificationProvider } from '@/contexts/OrderNotificationContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Yükleniyor..." />
      </div>
    );
  }
  if (!user) {
    return null;
  }
  return (
    <OrderNotificationProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </OrderNotificationProvider>
  );
}

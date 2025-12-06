'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Phone, Clock, HelpCircle, FileText, Shield, MessageSquare, Settings, Sparkles } from 'lucide-react';
const settingsItems = [
  {
    title: 'Uygulama Ayarları',
    description: 'Kargo, ödeme ve mağaza ayarlarını yönetin',
    href: '/dashboard/settings/app',
    icon: Settings,
    color: 'bg-green-100 text-green-600',
  },
  {
    title: 'Giriş Avantajları',
    description: 'Kullanıcılara gösterilen giriş faydalarını düzenleyin',
    href: '/dashboard/settings/login-benefits',
    icon: Sparkles,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'İletişim Bilgileri',
    description: 'Telefon, e-posta ve adres bilgilerini yönetin',
    href: '/dashboard/settings/contact',
    icon: Phone,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Çalışma Saatleri',
    description: 'Mağaza çalışma saatlerini düzenleyin',
    href: '/dashboard/settings/working-hours',
    icon: Clock,
    color: 'bg-teal-100 text-teal-600',
  },
  {
    title: 'SSS',
    description: 'Sıkça sorulan soruları yönetin',
    href: '/dashboard/settings/faq',
    icon: HelpCircle,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    title: 'Kullanım Koşulları',
    description: 'Kullanım koşullarını düzenleyin',
    href: '/dashboard/settings/terms',
    icon: FileText,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Gizlilik Politikası',
    description: 'Gizlilik politikasını düzenleyin',
    href: '/dashboard/settings/privacy',
    icon: Shield,
    color: 'bg-red-100 text-red-600',
  },
  {
    title: 'İletişim Mesajları',
    description: 'Müşteri mesajlarını görüntüleyin',
    href: '/dashboard/settings/messages',
    icon: MessageSquare,
    color: 'bg-indigo-100 text-indigo-600',
  },
];
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-500 mt-1">Uygulama ayarlarını yönetin</p>
      </div>{' '}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

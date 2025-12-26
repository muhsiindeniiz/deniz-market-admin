'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    FolderTree,
    Megaphone,
    Ticket,
    Store,
    Star,
    Bell,
    Settings,
    BarChart3,
    Download,
    X,
    CircleDot,
    History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatNotifications } from '@/contexts/ChatNotificationContext';
const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/analytics', label: 'Analitik', icon: BarChart3 },
    { href: '/dashboard/orders', label: 'Siparişler', icon: ShoppingCart },
    { href: '/dashboard/products', label: 'Ürünler', icon: Package },
    { href: '/dashboard/categories', label: 'Kategoriler', icon: FolderTree },
    { href: '/dashboard/stores', label: 'Mağazalar', icon: Store },
    { href: '/dashboard/promos', label: 'Kampanyalar', icon: Megaphone },
    { href: '/dashboard/coupons', label: 'Kuponlar', icon: Ticket },
    { href: '/dashboard/wheel-prizes', label: 'Çark Ödülleri', icon: CircleDot },
    { href: '/dashboard/wheel-spins', label: 'Çark Geçmişi', icon: History },
    { href: '/dashboard/customers', label: 'Müşteriler', icon: Users },
    { href: '/dashboard/reviews', label: 'Değerlendirmeler', icon: Star },
    { href: '/dashboard/notifications', label: 'Bildirimler', icon: Bell },
    { href: '/dashboard/export', label: 'Dışa Aktar', icon: Download },
    { href: '/dashboard/settings', label: 'Ayarlar', icon: Settings },
];
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}
export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { totalUnreadMessages } = useChatNotifications();
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
            )}{' '}
            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <Store className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-gray-900">Deniz Market</span>
                    </Link>
                    <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>{' '}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        const showBadge = item.href === '/dashboard/orders' && totalUnreadMessages > 0;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-green-50 text-green-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                                {showBadge && (
                                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}

'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Bell, User, LogOut, ShoppingBag, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrderNotifications } from '@/contexts/OrderNotificationContext';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, signOut } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } =
        useOrderNotifications();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Az önce';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
        return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 lg:hidden">
                    <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 lg:flex-none" />
                <div className="flex items-center gap-2">
                    {/* Notification Bell */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 relative"
                        >
                            <Bell className="w-5 h-5 text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-white">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                </span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-green-600" />
                                        <span className="font-semibold text-gray-900">
                                            Yeni Siparişler
                                        </span>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={markAllAsRead}
                                                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                                                title="Tümünü okundu işaretle"
                                            >
                                                <Check className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button
                                                onClick={clearNotifications}
                                                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                                                title="Tümünü temizle"
                                            >
                                                <Trash2 className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Notification List */}
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                            <Bell className="w-10 h-10 mb-2 opacity-20" />
                                            <p className="text-sm">Henüz bildirim yok</p>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <Link
                                                key={notification.id}
                                                href={`/dashboard/orders/${notification.id}`}
                                                onClick={() => {
                                                    markAsRead(notification.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                                                    !notification.isRead ? 'bg-green-50' : ''
                                                }`}
                                            >
                                                <div
                                                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                                        !notification.isRead
                                                            ? 'bg-green-100'
                                                            : 'bg-gray-100'
                                                    }`}
                                                >
                                                    <ShoppingBag
                                                        className={`w-5 h-5 ${
                                                            !notification.isRead
                                                                ? 'text-green-600'
                                                                : 'text-gray-500'
                                                        }`}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Yeni Sipariş
                                                    </p>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        #{notification.order_number}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-sm font-semibold text-green-600">
                                                            {formatCurrency(notification.total_amount)}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {formatTimeAgo(notification.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2" />
                                                )}
                                            </Link>
                                        ))
                                    )}
                                </div>

                                {/* Footer */}
                                {notifications.length > 0 && (
                                    <Link
                                        href="/dashboard/orders"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="block px-4 py-3 text-center text-sm font-medium text-green-600 hover:bg-gray-50 border-t border-gray-200"
                                    >
                                        Tüm siparişleri görüntüle
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="hidden sm:flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-gray-900">Admin</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={signOut}>
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}

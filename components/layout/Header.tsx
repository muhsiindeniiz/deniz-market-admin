'use client';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
interface HeaderProps {
    onMenuClick: () => void;
}
export function Header({ onMenuClick }: HeaderProps) {
    const { user, signOut } = useAuth();
    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 lg:hidden">
                    <Menu className="w-5 h-5 text-gray-600" />
                </button>{' '}
                <div className="flex-1 lg:flex-none" />{' '}
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>{' '}
                    <div className="hidden sm:flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-gray-900">Admin</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>{' '}
                    <Button variant="ghost" size="sm" onClick={signOut}>
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}

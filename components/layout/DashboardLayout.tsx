'use client';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
interface DashboardLayoutProps {
    children: React.ReactNode;
}
export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="lg:pl-64 min-h-screen">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}

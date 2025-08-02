
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Link, useRouter } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { LayoutDashboard, User, Calendar, ShieldCheck } from 'lucide-react';

const menuItems = [
    {
        href: '/',
        label: 'dashboard',
        icon: LayoutDashboard,
        admin: false
    },
    {
        href: '/profile',
        label: 'profile',
        icon: User,
        admin: false
    },
    {
        href: '/my-bookings',
        label: 'myBookings',
        icon: Calendar,
        admin: false
    },
    {
        href: '/dashboard',
        label: 'adminDashboard',
        icon: ShieldCheck,
        admin: true
    }
];

export function AppSidebar() {
    const t = useTranslations('Sidebar');
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('userEmail');
            setIsAdmin(email === 'test@example.com');
        }
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="flex flex-col h-full">
            <SidebarMenu className="flex-1">
                {menuItems.map((item) => {
                    if (item.admin && !isAdmin) {
                        return null;
                    }
                    const isActive = pathname === item.href;
                    return (
                        <SidebarMenuItem key={item.href}>
                            <Link href={item.href}>
                                <SidebarMenuButton isActive={isActive}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{t(item.label as any)}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </div>
    );
}

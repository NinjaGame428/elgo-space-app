
'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Building2 } from 'lucide-react';

export function Header() {
  const t = useTranslations('Header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkAuthStatus = () => {
      if (typeof window !== 'undefined') {
          const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
          const email = localStorage.getItem('userEmail');
          setIsAuthenticated(loggedIn);
          setUserEmail(email);
      }
    };
    checkAuthStatus();
    
    window.addEventListener('storage', checkAuthStatus);
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
    }
    setIsAuthenticated(false);
    setUserEmail(null);
    router.push('/');
    router.refresh(); 
  };

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'fr' : 'en';
    handleLocaleChange(newLocale);
  };

  const isAdmin = userEmail === 'test@example.com';

  if (!isMounted) {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center max-w-[1550px] px-4">
                <div className="mr-auto flex">
                  <Link href="/" className="flex items-center space-x-2">
                    <Building2 className="h-6 w-6" />
                    <span className="font-bold text-lg">{t('title')}</span>
                  </Link>
                </div>
            </div>
        </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center max-w-[1550px] px-4">
        <div className="mr-auto flex">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6" />
            <span className="font-bold text-lg">{t('title')}</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={toggleLocale} size="sm">
            {locale.toUpperCase()}
          </Button>

          <nav className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">{t('myAccount')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                    <Link href="/profile">{t('profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-bookings">{t('myBookings')}</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                          <Link href="/dashboard">{t('adminDashboard')}</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>{t('logout')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">{t('login')}</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

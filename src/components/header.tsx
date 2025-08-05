
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
import { User, Building2, Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
    
    return () => {
        window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
    }
    setIsAuthenticated(false);
    setUserEmail(null);
    router.push('/');
  };

  const handleLocaleChange = (isFrench: boolean) => {
    const newLocale = isFrench ? 'fr' : 'en';
    router.replace(pathname, { locale: newLocale });
  };

  const isAdmin = userEmail === 'test@example.com';

  const headerClasses = cn(
    "sticky top-0 z-50 w-full transition-all duration-300",
    "bg-background/60 backdrop-blur-lg border-b border-border/30"
  );


  if (!isMounted) {
    return (
        <header className={headerClasses}>
            <div className="container flex h-20 items-center px-4 md:px-6">
                 <div className="mr-auto flex items-center">
                   <Link href="/" className="flex items-center space-x-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{t('title')}</span>
                  </Link>
                </div>
            </div>
        </header>
    );
  }

  return (
    <header className={headerClasses}>
      <div className="container flex h-20 items-center px-4 md:px-6">
        <div className="mr-auto flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{t('title')}</span>
            </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="language-switch" className="text-sm font-medium">EN</Label>
            <Switch
              id="language-switch"
              checked={locale === 'fr'}
              onCheckedChange={handleLocaleChange}
              aria-label="Language switch"
            />
            <Label htmlFor="language-switch" className="text-sm font-medium">FR</Label>
          </div>

          <nav className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">{t('myAccount')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card">
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
                <div className="space-x-2">
                    <Button asChild variant="ghost">
                        <Link href="/signup">{t('signUpLink')}</Link>
                    </Button>
                    <Button asChild className="font-bold">
                        <Link href="/login">{t('login')}</Link>
                    </Button>
                </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

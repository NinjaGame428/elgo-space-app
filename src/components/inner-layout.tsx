
'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export function InnerLayout({ children, locale }: { children: React.ReactNode; locale: string; }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith(`/${locale}/login`) || pathname.startsWith(`/${locale}/signup`);
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const showSidebar = !isHomePage && !isAuthPage;

  return (
    <div className="flex flex-1">
      {showSidebar && (
        <Sidebar>
          <AppSidebar />
        </Sidebar>
      )}
      <div className="flex-1">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
          {children}
        </main>
      </div>
    </div>
  );
}


'use client';

import { NextIntlClientProvider, useMessages } from 'next-intl';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/header';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { usePathname } from 'next/navigation';

function InnerLayout({ children, locale }: { children: React.ReactNode; locale: string; }) {
  const pathname = usePathname();
  // Using startsWith to correctly handle nested routes under /login or /signup
  const isAuthPage = pathname.startsWith(`/${locale}/login`) || pathname.startsWith(`/${locale}/signup`);
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const showSidebar = !isHomePage && !isAuthPage;

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1">
          {showSidebar && (
            <Sidebar>
              <AppSidebar />
            </Sidebar>
          )}
          <div className="flex-1">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
              {children}
            </main>
          </div>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

// Server component Root Layout
export default function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = useMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <InnerLayout locale={locale}>{children}</InnerLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

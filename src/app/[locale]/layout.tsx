
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/header';
import { InnerLayout } from '@/components/inner-layout';

// Server component Root Layout
export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

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
      <body className="antialiased bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="relative flex flex-col min-h-screen">
               <Header />
               <InnerLayout>
                  {children}
               </InnerLayout>
               <footer className="py-4 mt-auto text-center text-sm text-muted-foreground border-t">
                  Built by Heavenkeys Ltd
               </footer>
            </div>
            <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

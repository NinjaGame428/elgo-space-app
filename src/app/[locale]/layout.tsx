import {ReactNode} from 'react';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider, useMessages} from 'next-intl';

// Can be imported from a shared config
const locales = ['en', 'fr'];

export default function LocaleLayout({children, params: {locale}}: {children: ReactNode, params: {locale: string}}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  const messages = useMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

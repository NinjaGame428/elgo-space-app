import {ReactNode} from 'react';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'fr'];

export default function LocaleLayout({children, params: {locale}}: {children: ReactNode, params: {locale: string}}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return (
    <>
      {children}
    </>
  );
}

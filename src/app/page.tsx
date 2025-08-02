'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      router.replace('/en');
    }
  }, [pathname, router]);

  return null;
}

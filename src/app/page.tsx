'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// This component's purpose is to redirect the user from the root path `/`
// to the default locale's path, e.g., `/en`.
export default function RootPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If the user lands on the absolute root, redirect them to the
    // default locale's version of the home page.
    if (pathname === '/') {
      router.replace('/en');
    }
  }, [pathname, router]);

  // This page doesn't render anything itself; it only handles the redirect.
  return null;
}

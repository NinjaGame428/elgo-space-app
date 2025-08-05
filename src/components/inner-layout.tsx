
'use client';

import { Footer } from "./footer";

export function InnerLayout({ children }: { children: React.ReactNode; }) {
  return (
    <div className="flex-1 animate-fade-in-up">
        {children}
        <Footer />
    </div>
  );
}

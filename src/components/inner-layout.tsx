
'use client';

import { ChatWidget } from "./chat-widget";
import { Footer } from "./footer";

export function InnerLayout({ children }: { children: React.ReactNode; }) {
  return (
    <div className="flex-1 animate-fade-in-up">
        {children}
        <ChatWidget />
        <Footer />
    </div>
  );
}


'use client';

export function InnerLayout({ children, locale }: { children: React.ReactNode; locale: string; }) {
  return (
    <div className="flex-1">
        <main className="animate-fade-in-up">
            {children}
        </main>
    </div>
  );
}

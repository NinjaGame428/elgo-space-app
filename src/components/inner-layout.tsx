
'use client';

export function InnerLayout({ children, locale }: { children: React.ReactNode; locale: string; }) {
  return (
    <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">
            {children}
        </main>
    </div>
  );
}

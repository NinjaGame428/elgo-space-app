
'use client';

import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations('Footer');

    return (
        <footer className="w-full py-4 px-4 md:px-6 border-t bg-background">
            <div className="container mx-auto text-center text-sm text-muted-foreground">
                <p>{t('builtBy')}</p>
            </div>
        </footer>
    );
}

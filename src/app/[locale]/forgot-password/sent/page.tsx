
'use client';

import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Link } from '@/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';

export default function ForgotPasswordSentPage() {
  const t = useTranslations('ForgotPasswordSentPage');
  
  return (
    <div className="w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)]">
        <Card className="mx-auto w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <MailCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground mt-4">
              {t('title')}
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              {t('description')}
            </CardDescription>
          </CardHeader>
           <CardContent>
              <Button asChild>
                  <Link href="/login">{t('backToLoginLink')}</Link>
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                {t('didNotReceiveEmail')}{' '}
                <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                    {t('tryAgainLink')}
                </Link>
              </p>
           </CardContent>
        </Card>
    </div>
  );
}

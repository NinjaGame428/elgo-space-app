
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from '@/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ElgoIcon } from '@/components/elgo-icon';

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPasswordPage');
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Even if the user doesn't exist, we show a success message
        // to prevent email enumeration attacks.
        router.push('/forgot-password/sent');
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: t('requestFailedTitle'),
          description: data.message || t('requestFailedDescription'),
        });
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)]">
        <Card className="mx-auto w-full max-w-md space-y-6">
          <CardHeader className="text-center">
             <div className="flex items-center justify-center space-x-2 mb-4">
                <ElgoIcon className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Elgo Space</span>
             </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
              {t('title')}
            </CardTitle>
            <CardDescription className="mt-2">
              {t('description')}
            </CardDescription>
          </CardHeader>
           <CardContent>
            <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-12 text-base"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-bold" disabled={isLoading}>
                  {isLoading ? t('sendingButton') : t('sendButton')}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                  <Link href="/login" className="font-medium text-primary hover:underline">
                      {t('backToLoginLink')}
                  </Link>
              </p>
           </CardContent>
        </Card>
    </div>
  );
}

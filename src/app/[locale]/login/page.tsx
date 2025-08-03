
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);

    if (email === 'test@example.com' && password === 'password') {
      toast({
        title: t('loginSuccessTitle'),
        description: t('welcomeBackAdmin'),
      });
      router.push('/dashboard');
    } 
    else if (password === 'password') {
        toast({
            title: t('loginSuccessTitle'),
            description: t('welcomeBackUser'),
        });
        router.push('/');
    }
    else {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      toast({
        variant: "destructive",
        title: t('loginFailedTitle'),
        description: t('loginFailedDescription'),
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{t('login')}</CardTitle>
            <CardDescription>
              {t('loginDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t('passwordLabel')}</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('loggingInButton') : t('loginButton')}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {t('noAccount')}{' '}
              <Link href="/signup" className="underline">
                {t('signUpLink')}
              </Link>
            </div>
            <div className="mt-4 text-center text-sm space-y-2 border-t pt-4">
               <p className="text-muted-foreground">{t('demoCredentials')}</p>
               <p>{t('adminUser', {email: 'test@example.com', password: 'password'})}</p>
               <p>{t('regularUser', {password: 'password'})}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

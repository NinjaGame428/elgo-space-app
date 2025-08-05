
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Building2 } from 'lucide-react';

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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        const isAdmin = data.user.role === 'Admin';
        
        toast({
            title: t('loginSuccessTitle'),
            description: isAdmin ? t('welcomeBackAdmin') : t('welcomeBackUser'),
        });

        if (isAdmin) {
            router.push('/dashboard');
        } else {
            router.push('/my-bookings');
        }
      } else {
        toast({
          variant: "destructive",
          title: t('loginFailedTitle'),
          description: data.message || t('loginFailedDescription'),
        });
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div>
            <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Lauft</span>
            </Link>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
              {t('login')}
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {t('loginDescription')}
            </p>
          </div>
           <form onSubmit={handleLogin} className="space-y-6">
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
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? t('loggingInButton') : t('loginButton')}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
                {t('noAccount')}{' '}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                    {t('signUpLink')}
                </Link>
            </p>
            <Card className="mt-8 bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base text-center">{t('demoCredentials')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm space-y-2 text-muted-foreground">
                <p>{t('adminUser', {email: 'test@example.com', password: 'password'})}</p>
                <p>{t('regularUser', {password: 'password'})}</p>
              </CardContent>
            </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
          data-ai-hint="conference event"
        />
      </div>
    </div>
  );
}

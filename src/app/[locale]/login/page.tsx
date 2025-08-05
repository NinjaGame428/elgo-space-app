
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
import { users as initialUsers } from '@/lib/data';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : initialUsers;
    const userExists = users.some((user: any) => user.email === email);

    // In a real app, you'd check the password against a hashed version.
    // Here we just check for 'password' for demo purposes if the user exists.
    if (userExists && password === 'password') {
        setShow2FA(true);
    } else {
      toast({
        variant: "destructive",
        title: t('loginFailedTitle'),
        description: t('loginFailedDescription'),
      });
    }
    setIsLoading(false);
  };

  const handle2FAVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // For demo, any 6 digit code is valid
    if (otp.length === 6 && /^\d{6}$/.test(otp)) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        const isAdmin = email === 'test@example.com';
        
        toast({
            title: t('loginSuccessTitle'),
            description: isAdmin ? t('welcomeBackAdmin') : t('welcomeBackUser'),
        });

        if (isAdmin) {
            router.push('/dashboard');
        } else {
            router.push('/');
        }

    } else {
        toast({
            variant: "destructive",
            title: t('twoFaFailedTitle'),
            description: t('twoFaFailedDescription'),
        });
    }

    setIsLoading(false);
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
             <h1 className="text-3xl font-bold">{show2FA ? t('twoFaTitle') : t('login')}</h1>
            <p className="text-balance text-muted-foreground">
              {show2FA ? t('twoFaDescription') : t('loginDescription')}
            </p>
          </div>
           {!show2FA ? (
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
           ) : (
            <form onSubmit={handle2FAVerification} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="otp">{t('twoFaCodeLabel')}</Label>
                    <Input
                        id="otp"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('verifyingButton') : t('verifyButton')}
                </Button>
            </form>
           )}
           {!show2FA && (
            <>
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
            </>
           )}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              made by Heavenkeys
            </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="conference event"
        />
      </div>
    </div>
  );
}

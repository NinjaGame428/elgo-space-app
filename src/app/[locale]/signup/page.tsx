
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ElgoIcon } from '@/components/elgo-icon';

export default function SignupPage() {
  const t = useTranslations('SignupPage');
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t('accountCreatedTitle'),
          description: data.message || t('accountCreatedDescription'),
        });
        router.push('/login'); 
      } else {
        toast({
          variant: 'destructive',
          title: t('userExistsTitle'),
          description: data.message || t('userExistsDescription'),
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Error",
        description: "An unexpected error occurred during signup.",
      });
    }

    setIsLoading(false);
  };

  return (
     <div className="w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)]">
        <Card className="mx-auto w-full max-w-md space-y-6 glass-card">
          <CardHeader className="text-center">
             <div className="flex items-center justify-center space-x-2 mb-4">
                <ElgoIcon className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Elgo Space</span>
             </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
              {t('signUp')}
            </CardTitle>
            <CardDescription>
              {t('signUpDescription')}
            </CardDescription>
          </CardHeader>
           <CardContent>
             <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('nameLabel')}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="h-12 text-base"
                  />
                </div>
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
                 <div className="space-y-2">
                  <Label htmlFor="phone">{t('phoneLabel')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 555-555-5555"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                    className="h-12 text-base"
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
                    className="h-12 text-base"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-bold" disabled={isLoading}>
                  {isLoading ? t('creatingAccountButton') : t('createAccountButton')}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {t('hasAccount')}{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  {t('loginLink')}
                </Link>
              </p>
           </CardContent>
        </Card>
    </div>
  );
}

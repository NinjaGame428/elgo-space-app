
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from '@/navigation';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
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
        // Set auth info in localStorage
        window.localStorage.setItem('isLoggedIn', 'true');
        window.localStorage.setItem('userEmail', email);
        window.localStorage.setItem('userRole', data.user.role);
        
        const isAdmin = data.user.role === 'Admin';
        
        toast({
            title: t('loginSuccessTitle'),
            description: isAdmin ? t('welcomeBackAdmin') : t('welcomeBackUser'),
        });

        // Hard redirect to ensure header state is re-evaluated
        window.location.href = isAdmin ? '/dashboard' : '/my-bookings';
        
      } else {
        toast({
          variant: "destructive",
          title: t('loginFailedTitle'),
          description: data.message || t('loginFailedDescription'),
        });
        setIsLoading(false);
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)]">
      <div className="aurora-bg"></div>
        <Card className="mx-auto w-full max-w-md space-y-6 glass-card">
          <CardHeader className="text-center">
             <div className="flex items-center justify-center space-x-2 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Lauft</span>
             </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
              {t('login')}
            </CardTitle>
            <CardDescription className="mt-2">
              {t('loginDescription')}
            </CardDescription>
          </CardHeader>
           <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                  {isLoading ? t('loggingInButton') : t('loginButton')}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                  {t('noAccount')}{' '}
                  <Link href="/signup" className="font-medium text-primary hover:underline">
                      {t('signUpLink')}
                  </Link>
              </p>
           </CardContent>
        </Card>
    </div>
  );
}

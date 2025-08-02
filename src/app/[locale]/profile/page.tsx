
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const router = useRouter();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const isLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      setUserName(email.split('@')[0]); // Mock user name
    }
  }, [router]);

  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: t('profileUpdatedTitle'), description: t('profileUpdatedDescription') });
  };
  
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: t('passwordChangedTitle'), description: t('passwordChangedDescription') });
  };
  
  const handleDeleteAccount = () => {
     toast({
        title: t('accountDeletedTitle'),
        description: t('accountDeletedDescription'),
        variant: "destructive"
    });
    localStorage.clear();
    router.push('/');
  };


  return (
    <div className="flex-1 py-6">
      <div className="mx-auto max-w-3xl space-y-6">
          <header>
              <h1 className="text-3xl font-bold">{t('profile')}</h1>
              <p className="text-muted-foreground">{t('profileDescription')}</p>
          </header>

          <Card>
              <CardHeader>
                  <CardTitle>{t('personalInfo')}</CardTitle>
                  <CardDescription>{t('personalInfoDescription')}</CardDescription>
              </CardHeader>
               <form onSubmit={handleUpdateInfo}>
                  <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="name">{t('nameLabel')}</Label>
                          <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="email">{t('emailLabel')}</Label>
                          <Input id="email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                      </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6">
                      <Button type="submit">{t('saveChanges')}</Button>
                  </CardFooter>
               </form>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>{t('security')}</CardTitle>
                  <CardDescription>{t('securityDescription')}</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdatePassword}>
                  <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="current-password">{t('currentPassword')}</Label>
                          <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="new-password">{t('newPassword')}</Label>
                          <Input id="new-password" type="password" />
                      </div>
                       <div className="space-y-2">
                          <Label htmlFor="confirm-password">{t('confirmNewPassword')}</Label>
                          <Input id="confirm-password" type="password" />
                      </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6">
                      <Button type="submit">{t('updatePassword')}</Button>
                  </CardFooter>
              </form>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>{t('myBookings')}</CardTitle>
                  <CardDescription>{t('myBookingsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">{t('myBookingsInfo')}</p>
              </CardContent>
              <CardFooter className="border-t pt-6">
                  <Button variant="outline" asChild>
                      <Link href="/my-bookings">{t('viewMyBookings')}</Link>
                  </Button>
              </CardFooter>
          </Card>

          <Card className="border-destructive">
              <CardHeader>
                  <CardTitle>{t('dangerZone')}</CardTitle>
                  <CardDescription>{t('dangerZoneDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">{t('dangerZoneInfo')}</p>
              </CardContent>
              <CardFooter className="border-t pt-6">
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive">{t('deleteAccount')}</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                          <AlertDialogDescription>
                              {t('deleteAccountWarning')}
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                              {t('delete')}
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </CardFooter>
          </Card>
      </div>
    </div>
  );
}

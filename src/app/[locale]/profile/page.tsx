
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/login');
      return;
    }

    async function fetchUser() {
        try {
            // Find user by email - a more robust approach would be to have a dedicated endpoint
            const res = await fetch(`/api/users?email=${userEmail}`);
            if(!res.ok) throw new Error('Failed to fetch user');
            const users: User[] = await res.json();
            if(users.length > 0) {
                const currentUser = users[0];
                setUser(currentUser);
                setName(currentUser.name || '');
                setEmail(currentUser.email || '');
            } else {
                 throw new Error('User not found');
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Error", description: "Could not load your profile data." });
        } finally {
            setIsLoading(false);
        }
    }
    fetchUser();
  }, [router, toast]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);

    try {
        const response = await fetch(`/api/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }
        toast({ title: t('profileUpdatedTitle'), description: t('profileUpdatedDescription') });

        if (email !== user.email) {
            localStorage.setItem('userEmail', email);
        }

    } catch (error: any) {
        toast({ variant: 'destructive', title: "Update Failed", description: error.message });
    } finally {
        setIsUpdating(false);
    }
  };
  
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API endpoint to securely update the password.
    // This requires handling current password verification on the server.
    // For now, we just show a success message as a placeholder.
    toast({ title: t('passwordChangedTitle'), description: t('passwordChangedDescription') });
    (e.target as HTMLFormElement).reset();
  };
  
  const handleDeleteAccount = async () => {
    if(!user) return;
    try {
        const response = await fetch(`/api/users/${user.id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete account.');

        toast({
            title: t('accountDeletedTitle'),
            description: t('accountDeletedDescription'),
            variant: "destructive"
        });
        localStorage.clear();
        router.push('/');

    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error", description: error.message });
    }
  };

  if (isLoading) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-72 mt-2" />
            </header>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-40" />
                            <Skeleton className="h-5 w-64 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                           <Skeleton className="h-11 w-28" />
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
  }

  if(!user) {
    return <div className="flex items-center justify-center min-h-screen">User not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{t('profile')}</h1>
            <p className="text-lg text-muted-foreground">{t('profileDescription')}</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('personalInfo')}</CardTitle>
                    <CardDescription>{t('personalInfoDescription')}</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateInfo}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('nameLabel')}</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isUpdating} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('emailLabel')}</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isUpdating}/>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/50 px-6 py-4">
                        <Button type="submit" disabled={isUpdating}>{isUpdating ? "Saving..." : t('saveChanges')}</Button>
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
                    <CardFooter className="border-t bg-muted/50 px-6 py-4">
                        <Button type="submit">{t('updatePassword')}</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>

        <div className="md:col-span-1 space-y-8">
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle>{t('dangerZone')}</CardTitle>
                    <CardDescription>{t('dangerZoneDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{t('dangerZoneInfo')}</p>
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
                </CardContent>
            </Card>
        </div>
        </div>
    </div>
  );
}

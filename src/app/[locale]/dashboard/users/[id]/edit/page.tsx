
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditUserPage() {
    const t = useTranslations('EditUserPage');
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'User' | 'Admin'>('User');
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!id) return;

        async function fetchUser() {
            try {
                const response = await fetch(`/api/users/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const userData: User = await response.json();
                setUser(userData);
                setName(userData.name || '');
                setEmail(userData.email || '');
                setRole(userData.role);

            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: t('userNotFound') });
                router.push('/dashboard');
            } finally {
                setIsLoading(false);
            }
        }

        fetchUser();

    }, [id, router, toast, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) return;
        setIsLoading(true);

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user');
            }

            toast({
                title: t('userUpdatedTitle'),
                description: t('userUpdatedDescription'),
            });
            router.push('/dashboard');

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Update failed',
                description: error.message,
            });
             setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
                 <Card className="w-full max-w-lg">
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-24" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-24" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                             <Skeleton className="h-5 w-24" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                        <Skeleton className="h-11 w-32" />
                    </CardFooter>
                 </Card>
            </div>
        )
    }

     if (!user) {
        return <div className="flex items-center justify-center min-h-screen">{t('userNotFound')}</div>;
    }

    const pageTitle = role === 'Admin' ? t('editAdminTitle') : t('editUserTitle');
    const pageDescription = role === 'Admin' ? t('editAdminDescription') : t('editUserDescription');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-lg animate-fade-in-up">
                 <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{pageTitle}</CardTitle>
                            <CardDescription>{pageDescription}</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard"><ArrowLeft /></Link>
                        </Button>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('nameLabel')}</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('emailLabel')}</Label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">{t('roleLabel')}</Label>
                            <Select value={role} onValueChange={(value: 'User' | 'Admin') => setRole(value)}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="User">{t('roleUser')}</SelectItem>
                                    <SelectItem value="Admin">{t('roleAdmin')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                        <Button type="submit" size="lg" disabled={isLoading}>{isLoading ? t('saving') : t('saveChangesButton')}</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

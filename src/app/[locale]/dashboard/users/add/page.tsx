
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Header } from '@/components/header';

export default function AddUserPage() {
    const t = useTranslations('AddUserPage');
    const router = useRouter();
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'User' | 'Admin'>('User');
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const storedUsers = localStorage.getItem('users');
        setUsers(storedUsers ? JSON.parse(storedUsers) : initialUsers);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (users.some(user => user.email === email)) {
            toast({
                variant: 'destructive',
                title: t('userExistsTitle'),
                description: t('userExistsDescription'),
            });
            return;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            email,
            role,
            joined: format(new Date(), 'yyyy-MM-dd')
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        toast({
            title: t('userAddedTitle'),
            description: t('userAddedDescription'),
        });
        router.push('/dashboard');
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
             <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>{t('addUserTitle')}</CardTitle>
                        <CardDescription>{t('addUserDescription')}</CardDescription>
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
                        <CardFooter className="flex justify-between">
                            <Button type="submit">{t('addUserButton')}</Button>
                             <Button variant="outline" asChild>
                                <Link href="/dashboard">{t('backToDashboard')}</Link>
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </main>
        </div>
    );
}

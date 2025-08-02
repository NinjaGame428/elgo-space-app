
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Header } from '@/components/header';

export default function EditUserPage() {
    const t = useTranslations('EditUserPage');
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [user, setUser] = useState<User | null>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'User' | 'Admin'>('User');
    
    useEffect(() => {
        const storedUsers = localStorage.getItem('users');
        const parsedUsers = storedUsers ? JSON.parse(storedUsers) : initialUsers;
        setUsers(parsedUsers);
        const foundUser = parsedUsers.find((u: User) => u.id === id);
        if (foundUser) {
            setUser(foundUser);
            setName(foundUser.name);
            setEmail(foundUser.email);
            setRole(foundUser.role);
        } else {
            toast({ variant: 'destructive', title: t('userNotFound') });
            router.push('/dashboard');
        }
    }, [id, router, toast, t]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if another user already has the new email
        if (users.some(u => u.email === email && u.id !== id)) {
            toast({
                variant: 'destructive',
                title: t('emailInUseTitle'),
                description: t('emailInUseDescription'),
            });
            return;
        }

        const updatedUser: User = { ...user!, name, email, role };
        
        const updatedUsers = users.map(u => u.id === id ? updatedUser : u);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        toast({
            title: t('userUpdatedTitle'),
            description: t('userUpdatedDescription'),
        });
        router.push('/dashboard');
    };

     if (!user) {
        return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
             <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>{t('editUserTitle')}</CardTitle>
                        <CardDescription>{t('editUserDescription')}</CardDescription>
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
                            <Button type="submit">{t('saveChangesButton')}</Button>
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

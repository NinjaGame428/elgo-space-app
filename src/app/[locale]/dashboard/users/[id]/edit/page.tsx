
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
import { users as initialUsers } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

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
            setName(foundUser.name || '');
            setEmail(foundUser.email || '');
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-lg animate-fade-in-up">
                 <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{t('editUserTitle')}</CardTitle>
                            <CardDescription>{t('editUserDescription')}</CardDescription>
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
                        <Button type="submit" size="lg">{t('saveChangesButton')}</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

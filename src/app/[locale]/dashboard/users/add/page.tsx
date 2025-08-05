
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

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
            joined_at: format(new Date(), 'yyyy-MM-dd'),
            phone: null,
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-lg animate-fade-in-up">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{t('addUserTitle')}</CardTitle>
                            <CardDescription>{t('addUserDescription')}</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard"><ArrowLeft/></Link>
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
                         <Button type="submit" size="lg">{t('addUserButton')}</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

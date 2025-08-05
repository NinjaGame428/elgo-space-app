
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

export default function AddUserPage() {
    const t = useTranslations('AddUserPage');
    const router = useRouter();
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'User' | 'Admin'>('User');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // We use the standard signup API route to create the user.
            // This ensures the same validation and creation logic is used.
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone: '' }), // Phone is not on this form
            });

            const data = await response.json();

            if (!response.ok) {
                 throw new Error(data.message || t('userExistsDescription'));
            }

            // After successful creation via Auth, update the role via our user management API
            if (role === 'Admin' && data.user?.id) {
                const roleUpdateResponse = await fetch(`/api/users/${data.user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: 'Admin' }),
                });

                if (!roleUpdateResponse.ok) {
                    // Log error but don't fail the whole process, user is created.
                    console.error('Failed to set admin role for new user.');
                }
            }

            toast({
                title: t('userAddedTitle'),
                description: t('userAddedDescription'),
            });
            router.push('/dashboard');

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: t('userExistsTitle'),
                description: error.message,
            });
        } finally {
             setIsLoading(false);
        }
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
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('emailLabel')}</Label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('passwordLabel')}</Label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">{t('roleLabel')}</Label>
                            <Select value={role} onValueChange={(value: 'User' | 'Admin') => setRole(value)} disabled={isLoading}>
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
                         <Button type="submit" size="lg" disabled={isLoading}>{isLoading ? t('creatingUser') : t('addUserButton')}</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

    
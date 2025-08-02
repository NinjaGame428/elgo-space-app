
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Header } from '@/components/header';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
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
    toast({ title: "Profile Updated", description: "Your personal information has been saved." });
  };
  
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Password Changed", description: "Your password has been updated successfully." });
  };
  
  const handleDeleteAccount = () => {
     toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
        variant: "destructive"
    });
    localStorage.clear();
    router.push('/');
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
            <header>
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your name and email address.</CardDescription>
                </CardHeader>
                 <form onSubmit={handleUpdateInfo}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                        <Button type="submit">Save Changes</Button>
                    </CardFooter>
                 </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Change your password.</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdatePassword}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                        <Button type="submit">Update Password</Button>
                    </CardFooter>
                </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>My Bookings</CardTitle>
                    <CardDescription>View your past and upcoming reservations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You can find all your booking details on your dedicated bookings page.</p>
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <Button variant="outline" asChild>
                        <Link href="/my-bookings">View My Bookings</Link>
                    </Button>
                </CardFooter>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>Permanently delete your account and all associated data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This action is irreversible. Please be certain before proceeding.</p>
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive">Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
      </main>
    </div>
  );
}

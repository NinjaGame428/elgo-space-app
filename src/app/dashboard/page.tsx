
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();

    const handleLogout = () => {
        // In a real app, you would clear the user's session here.
        router.push('/');
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="absolute top-4 right-4">
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Dashboard</CardTitle>
          <CardDescription>Welcome to your authenticated area.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You are successfully logged in.</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

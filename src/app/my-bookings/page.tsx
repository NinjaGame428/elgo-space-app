
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bookings as initialBookings, locations } from "@/lib/data";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { Booking } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MyBookingsPage() {
    const router = useRouter();
    const [userBookings, setUserBookings] = useState<Booking[]>([]);

    useEffect(() => {
        // In a real app, you'd fetch this based on the logged-in user's ID.
        // We'll filter for a specific user for this mock.
        setUserBookings(initialBookings.filter(b => b.userEmail.startsWith('user')));
    }, []);
    
    // In a real app, you would protect this route
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="flex items-center justify-between p-4 border-b">
                <Button variant="ghost" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Locations
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">My Bookings</h1>
                <div></div>
            </header>

            <main className="flex-1 p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Reservations</CardTitle>
                        <CardDescription>Here is a list of your past and upcoming bookings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {userBookings.length > 0 ? (
                                userBookings.map(booking => {
                                    const location = locations.find(l => l.id === booking.locationId);
                                    return (
                                        <div key={booking.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div>
                                                <p className="font-semibold">{location?.name || 'Unknown Location'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(booking.startTime), 'PPP, p')} - {format(new Date(booking.endTime), 'p')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {booking.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                                                {booking.status === 'approved' && <Badge>Approved</Badge>}
                                                {booking.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-muted-foreground text-center py-8">You have no bookings.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}


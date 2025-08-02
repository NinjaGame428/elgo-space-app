
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { bookings as initialBookings, locations } from "@/lib/data";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { Booking } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const loggedInEmail = localStorage.getItem('userEmail');
        if (loggedInEmail !== 'test@example.com') {
            router.push('/login');
        } else {
            setIsAdmin(true);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        router.push('/');
    };

    const handleApproval = (bookingId: string, status: 'approved' | 'rejected') => {
        setBookings(currentBookings => 
            currentBookings.map(b => 
                b.id === bookingId ? { ...b, status } : b
            )
        );
    };

    const bookingsForSelectedDay = bookings.filter(booking => 
        selectedDate && format(new Date(booking.startTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );

    const bookedDates = bookings.map(b => new Date(b.startTime));

  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="flex items-center justify-between p-4 border-b">
             <Button variant="ghost" asChild>
                <Link href="/">
                   Lauft
                </Link>
            </Button>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </header>

        <main className="flex-1 p-4 md:p-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Calendar</CardTitle>
                        <CardDescription>Select a date to view bookings.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                            modifiers={{ booked: bookedDates }}
                            modifiersClassNames={{ booked: 'bg-primary/20' }}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Bookings for {selectedDate ? format(selectedDate, 'PPP') : '...'}</CardTitle>
                        <CardDescription>Review and manage bookings for the selected date.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {bookingsForSelectedDay.length > 0 ? (
                                bookingsForSelectedDay.map(booking => {
                                    const location = locations.find(l => l.id === booking.locationId);
                                    return (
                                        <div key={booking.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div>
                                                <p className="font-semibold">{location?.name || 'Unknown Location'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
                                                </p>
                                                <p className="text-sm">Booked by: {booking.userEmail}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {booking.status === 'pending' && (
                                                    <>
                                                        <Button size="sm" onClick={() => handleApproval(booking.id, 'approved')}>Approve</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleApproval(booking.id, 'rejected')}>Reject</Button>
                                                    </>
                                                )}
                                                {booking.status === 'approved' && <Badge>Approved</Badge>}
                                                {booking.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-muted-foreground">No bookings for this date.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}

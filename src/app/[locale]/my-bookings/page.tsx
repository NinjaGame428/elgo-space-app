
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isAfter } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { Booking, Location } from '@/lib/types';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyBookingsPage() {
    const t = useTranslations('MyBookingsPage');
    const tloc = useTranslations('LocationNames');
    const router = useRouter();
    const { toast } = useToast();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsClient(true);
        const isLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false;
        const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

        if (!isLoggedIn || !userEmail) {
            router.push('/login');
            return;
        }

        async function fetchData() {
            try {
                const [bookingsRes, locationsRes] = await Promise.all([
                    fetch(`/api/bookings?userEmail=${userEmail}`),
                    fetch('/api/locations')
                ]);

                if (!bookingsRes.ok || !locationsRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const bookingsData = await bookingsRes.json();
                const locationsData = await locationsRes.json();
                
                setBookings(bookingsData);
                setLocations(locationsData);
            } catch (error) {
                console.error("Failed to fetch bookings/locations", error);
                toast({ variant: 'destructive', title: "Error", description: "Could not load your data." });
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchData();

    }, [router, toast]);


    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }, [bookings]);

    const { upcomingBookings, pastBookings } = useMemo(() => {
        const now = new Date();
        return sortedBookings.reduce((acc, booking) => {
            if (isAfter(new Date(booking.endTime), now) && booking.status !== 'rejected') {
                acc.upcomingBookings.push(booking);
            } else {
                acc.pastBookings.push(booking);
            }
            return acc;
        }, { upcomingBookings: [] as Booking[], pastBookings: [] as Booking[] });
    }, [sortedBookings]);

    const cancelBooking = async (bookingId: string) => {
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to cancel booking');
            
            setBookings(prev => prev.filter(b => b.id !== bookingId));
            toast({ title: t('bookingCancelledTitle'), description: t('bookingCancelledDescription') });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not cancel booking." });
        }
    };

    const handleBookingClick = (booking: Booking) => {
        setSelectedBooking(booking);
    };

    const selectedBookingLocation = useMemo(() => {
        if (!selectedBooking) return null;
        return locations.find(l => l.id === selectedBooking.locationId);
    }, [selectedBooking, locations]);

    const BookingCard = ({ booking }: { booking: Booking }) => {
        const location = locations.find(l => l.id === booking.locationId);
        const isUpcoming = isAfter(new Date(booking.endTime), new Date()) && booking.status !== 'rejected';
        
        const isCancelled = booking.status === 'rejected';

        return (
            <div 
                className={`p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${!isUpcoming ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                onClick={!isUpcoming ? () => handleBookingClick(booking) : undefined}
            >
                <div>
                    <p className="font-semibold">{location ? tloc(location.name as any) : t('unknownLocation')}</p>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.startTime), 'PPP, p')} - {format(new Date(booking.endTime), 'p')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={
                        isCancelled ? 'destructive' :
                        booking.status === 'approved' ? 'default' : 'secondary'
                    }>{t(booking.status as any)}</Badge>
                    {isUpcoming && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/my-bookings/${booking.id}/edit`}>{t('reschedule')}</Link>
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">{t('cancelBooking')}</DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                                            <AlertDialogDescription>{t('cancelWarning')}</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('goBack')}</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => cancelBooking(booking.id)}>{t('confirmCancel')}</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        );
    };

    if (!isClient || isLoading) {
        return (
            <div className="grid md:grid-cols-3 gap-6 flex-1 p-4 sm:p-6 lg:p-8">
                <div className="md:col-span-2">
                    <Card className="flex flex-col h-full">
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64 mt-2" />
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1 pt-4">
                            <div className="space-y-4">
                               <Skeleton className="h-24 w-full" />
                               <Skeleton className="h-24 w-full" />
                               <Skeleton className="h-24 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-3 gap-6 flex-1 p-4 sm:p-6 lg:p-8">
            <div className="md:col-span-2">
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>{t('yourReservations')}</CardTitle>
                        <CardDescription>{t('reservationsDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <Tabs defaultValue="upcoming" className="flex flex-col flex-1">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upcoming">{t('upcoming')}</TabsTrigger>
                                <TabsTrigger value="past">{t('past')}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upcoming" className="pt-4 flex-1">
                                <div className="space-y-4">
                                    {upcomingBookings.length > 0 ? (
                                        upcomingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">{t('noUpcomingBookings')}</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="past" className="pt-4 flex-1">
                                <div className="space-y-4">
                                    {pastBookings.length > 0 ? (
                                        pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">{t('noPastBookings')}</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1">
                {/* Extra column for future content or spacing */}
            </div>

            <Dialog open={!!selectedBooking} onOpenChange={(isOpen) => !isOpen && setSelectedBooking(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('bookingDetails')}</DialogTitle>
                        <DialogDescription>{t('bookingDetailsDescription')}</DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="space-y-4">
                             <div>
                                <h4 className="font-semibold">{t('location')}</h4>
                                <p>{selectedBookingLocation ? tloc(selectedBookingLocation.name as any) : ''}</p>
                                <p className="text-sm text-muted-foreground">{selectedBookingLocation?.address}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">{t('dateTime')}</h4>
                                <p>{format(new Date(selectedBooking.startTime), 'PPP, p')} - {format(new Date(selectedBooking.endTime), 'p')}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">{t('status')}</h4>
                                 <Badge variant={
                                    selectedBooking.status === 'approved' ? 'default' :
                                    selectedBooking.status === 'rejected' ? 'destructive' : 'secondary'
                                }>{t(selectedBooking.status as any)}</Badge>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

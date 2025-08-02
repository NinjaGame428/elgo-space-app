
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bookings as initialBookings, locations as initialLocations } from "@/lib/data";
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

export default function MyBookingsPage() {
    const t = useTranslations('MyBookingsPage');
    const router = useRouter();
    const { toast } = useToast();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        const isLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false;
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        const storedBookings = typeof window !== 'undefined' ? localStorage.getItem('bookings') : null;
        const storedLocations = typeof window !== 'undefined' ? localStorage.getItem('locations') : null;
        
        setBookings(storedBookings ? JSON.parse(storedBookings) : initialBookings);
        setLocations(storedLocations ? JSON.parse(storedLocations) : initialLocations);
    }, [router]);

    const userBookings = useMemo(() => {
        const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
        if (!userEmail) return [];
        return bookings
            .filter(b => b.userEmail === userEmail)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }, [bookings]);

    const { upcomingBookings, pastBookings } = useMemo(() => {
        const now = new Date();
        return userBookings.reduce((acc, booking) => {
            if (isAfter(new Date(booking.endTime), now) && booking.status !== 'rejected') {
                acc.upcomingBookings.push(booking);
            } else {
                acc.pastBookings.push(booking);
            }
            return acc;
        }, { upcomingBookings: [] as Booking[], pastBookings: [] as Booking[] });
    }, [userBookings]);

    const cancelBooking = (bookingId: string) => {
        const updatedBookings = bookings.filter(b => b.id !== bookingId);
        setBookings(updatedBookings);
        localStorage.setItem('bookings', JSON.stringify(updatedBookings));
        toast({ title: t('bookingCancelledTitle'), description: t('bookingCancelledDescription') });
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
                className={`p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${!isUpcoming && 'cursor-pointer hover:bg-muted/50'}`}
                onClick={!isUpcoming ? () => handleBookingClick(booking) : undefined}
            >
                <div>
                    <p className="font-semibold">{location?.name || t('unknownLocation')}</p>
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

    return (
        <div className="flex flex-col flex-1 p-4 md:p-6 items-center">
            <div className="w-full max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('yourReservations')}</CardTitle>
                        <CardDescription>{t('reservationsDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="upcoming">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upcoming">{t('upcoming')}</TabsTrigger>
                                <TabsTrigger value="past">{t('past')}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upcoming" className="pt-4">
                                <div className="space-y-4">
                                    {upcomingBookings.length > 0 ? (
                                        upcomingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">{t('noUpcomingBookings')}</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="past" className="pt-4">
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
                                <p>{selectedBookingLocation?.name}</p>
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

    

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isValid, isBefore } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { Booking, Location } from '@/lib/types';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CalendarDays, MapPin } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase';

interface MyBookingsClientContentProps {
    bookings: Booking[];
    locations: Location[];
}

function MyBookingsClientContent({ bookings: initialBookings, locations: initialLocations }: MyBookingsClientContentProps) {
    const t = useTranslations('MyBookingsPage');
    const tloc = useTranslations('LocationNames');
    const { toast } = useToast();
    const supabase = createClient();

    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [locations, setLocations] = useState<Location[]>(initialLocations);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        setUserEmail(localStorage.getItem('userEmail'));
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!userEmail) return;

        const handleBookingChanges = (payload: any) => {
             const { eventType, new: newRecord, old: oldRecord } = payload;
             const recordId = newRecord?.id || oldRecord?.id;
             if (eventType === 'INSERT' && newRecord.user_email === userEmail) {
                 const newBooking: Booking = {
                    id: newRecord.id,
                    locationId: newRecord.location_id,
                    userEmail: newRecord.user_email,
                    startTime: newRecord.start_time,
                    endTime: newRecord.end_time,
                    status: newRecord.status,
                    department: newRecord.department,
                    occasion: newRecord.occasion,
                 };
                setBookings(current => [...current, newBooking]);
             } else if (eventType === 'UPDATE' && newRecord.user_email === userEmail) {
                setBookings(current => current.map(b => b.id === recordId ? {
                    ...b, 
                    status: newRecord.status, 
                    startTime: newRecord.start_time,
                    endTime: newRecord.end_time,
                } : b));
             } else if (eventType === 'DELETE' && oldRecord.user_email === userEmail) {
                setBookings(current => current.filter(b => b.id !== recordId));
             }
        };

        const bookingsSubscription = supabase
            .channel(`my-bookings-${userEmail}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_email=eq.${userEmail}` }, handleBookingChanges)
            .subscribe();
        
        return () => {
            supabase.removeChannel(bookingsSubscription);
        };
    }, [userEmail, supabase]);

    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [bookings]);

    const { upcomingBookings, currentBookings, pastBookings } = useMemo(() => {
        const now = currentTime;
        const partitions: { upcomingBookings: Booking[], currentBookings: Booking[], pastBookings: Booking[] } = {
            upcomingBookings: [],
            currentBookings: [],
            pastBookings: [],
        };

        sortedBookings.forEach(booking => {
            const startTime = new Date(booking.startTime);
            const endTime = new Date(booking.endTime);

            if (!isValid(startTime) || !isValid(endTime)) {
                partitions.pastBookings.push(booking); // Treat invalid dates as past
                return;
            }
            
            if (isBefore(now, startTime)) {
                partitions.upcomingBookings.push(booking);
            } else if (isBefore(now, endTime)) {
                partitions.currentBookings.push(booking);
            } else {
                partitions.pastBookings.push(booking);
            }
        });
        
        // Past bookings should be sorted descending
        partitions.pastBookings.reverse();

        return partitions;
    }, [sortedBookings, currentTime]);

    const cancelBooking = async (bookingId: string) => {
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to cancel booking');
            
            // State will update via Supabase Realtime
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
        
        const startTime = new Date(booking.startTime);
        const endTime = new Date(booking.endTime);
        const areDatesValid = isValid(startTime) && isValid(endTime);
        const isMultiDay = areDatesValid && format(startTime, 'yyyy-MM-dd') !== format(endTime, 'yyyy-MM-dd');
        
        const now = currentTime;
        const isUpcoming = areDatesValid && isBefore(now, startTime);
        const isCancellable = isUpcoming && booking.status !== 'rejected';

        const statusBadgeVariant = 
            booking.status === 'rejected' ? 'destructive' :
            booking.status === 'approved' ? 'default' : 'secondary';

        return (
             <Card 
                className="transition-all hover:shadow-md cursor-pointer"
                onClick={() => handleBookingClick(booking)}
            >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                     <div>
                        <p className="font-semibold text-lg">{location ? tloc(location.name as any) : t('unknownLocation')}</p>
                         <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {location?.address || '...'}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                           <CalendarDays className="h-4 w-4" />
                           {areDatesValid 
                                ? isMultiDay
                                    ? `${format(startTime, 'PPP')} - ${format(endTime, 'PPP')}`
                                    : format(startTime, 'PPP')
                                : t('invalidDate')
                            }
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <Badge variant={statusBadgeVariant}>{t(booking.status as any)}</Badge>
                        {isCancellable && (
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
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">{t('cancelBooking')}</DropdownMenuItem>
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
                </CardContent>
             </Card>
        );
    };
    
    const EmptyState = ({ title, description, showButton }: { title: string, description: string, showButton?: boolean }) => (
        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
            {showButton && (
                <Button asChild className="mt-4">
                    <Link href="/">{t('browseLocations')}</Link>
                </Button>
            )}
        </div>
    );

    return (
        <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 animate-fade-in-up">
             <header>
                <h1 className="text-3xl font-bold tracking-tight">{t('yourReservations')}</h1>
                <p className="text-lg text-muted-foreground">{t('reservationsDescription')}</p>
            </header>

            <Tabs defaultValue="upcoming">
                <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
                    <TabsTrigger value="upcoming">{t('upcoming')}</TabsTrigger>
                    <TabsTrigger value="current">{t('current')}</TabsTrigger>
                    <TabsTrigger value="past">{t('past')}</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="pt-6">
                    <div className="space-y-4">
                        {upcomingBookings.length > 0 ? (
                            upcomingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                        ) : (
                            <EmptyState 
                                title={t('noUpcomingBookings')} 
                                description={t('noUpcomingBookingsHint')}
                                showButton
                            />
                        )}
                    </div>
                </TabsContent>
                
                <TabsContent value="current" className="pt-6">
                    <div className="space-y-4">
                        {currentBookings.length > 0 ? (
                             currentBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                        ) : (
                             <EmptyState 
                                title={t('noCurrentBookings')} 
                                description={t('noCurrentBookingsHint')}
                            />
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="past" className="pt-6">
                    <div className="space-y-4">
                        {pastBookings.length > 0 ? (
                            pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                        ) : (
                            <EmptyState 
                                title={t('noPastBookings')}
                                description={t('noPastBookingsHint')}
                            />
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={!!selectedBooking} onOpenChange={(isOpen) => !isOpen && setSelectedBooking(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('bookingDetails')}</DialogTitle>
                        <DialogDescription>{t('bookingDetailsDescription')}</DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (() => {
                        const startDate = new Date(selectedBooking.startTime);
                        const endDate = new Date(selectedBooking.endTime);
                        const areDatesValid = isValid(startDate) && isValid(endDate);
                        const isMultiDay = areDatesValid && format(startDate, 'yyyy-MM-dd') !== format(endDate, 'yyyy-MM-dd');
                        return (
                            <div className="space-y-4 pt-4">
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">{t('location')}</h4>
                                    <p>{selectedBookingLocation ? tloc(selectedBookingLocation.name as any) : ''}</p>
                                    <p className="text-sm text-muted-foreground">{selectedBookingLocation?.address}</p>
                                </div>
                                 <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">{t('department')}</h4>
                                    <p>{selectedBooking.department || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">{t('occasion')}</h4>
                                    <p>{selectedBooking.occasion || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">{t('dateTime')}</h4>
                                     <p>
                                        {areDatesValid 
                                            ? isMultiDay
                                                ? `${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`
                                                : format(startDate, 'PPP')
                                            : t('invalidDate')
                                        }
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">{t('status')}</h4>
                                    <Badge variant={
                                        selectedBooking.status === 'approved' ? 'default' :
                                        selectedBooking.status === 'rejected' ? 'destructive' : 'secondary'
                                    }>{t(selectedBooking.status as any)}</Badge>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function MyBookingsSkeleton() {
    return (
        <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
            <header>
                <Skeleton className="h-10 w-60 mb-2" />
                <Skeleton className="h-5 w-80" />
            </header>
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
}

export default function MyBookingsPage() {
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        const userEmail = localStorage.getItem('userEmail');

        if (!userEmail) {
            router.push('/login');
            return;
        }

        async function fetchData() {
            try {
                const [bookingsRes, locationsRes] = await Promise.all([
                    fetch(`/api/bookings?userEmail=${userEmail}`),
                    fetch('/api/locations'),
                ]);

                if (!bookingsRes.ok || !locationsRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const bookingsData = await bookingsRes.json();
                const locationsData = await locationsRes.json();

                setBookings(bookingsData);
                setLocations(locationsData);
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast({ variant: 'destructive', title: "Error", description: "Could not load your data." });
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();

    }, [router, toast]);
    
    if (!isClient || isLoading) {
        return <MyBookingsSkeleton />;
    }

    return <MyBookingsClientContent bookings={bookings} locations={locations} />;
}

    
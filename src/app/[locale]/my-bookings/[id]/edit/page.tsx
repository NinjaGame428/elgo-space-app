
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import type { Booking, Location } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { addDays, format, formatISO, startOfDay, endOfDay, eachDayOfInterval, isValid } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBookingPage() {
    const t = useTranslations('EditBookingPage');
    const tloc = useTranslations('LocationNames');
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [allBookingsForLocation, setAllBookingsForLocation] = useState<Booking[]>([]);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [location, setLocation] = useState<Location | null>(null);

    const [date, setDate] = useState<DateRange | undefined>();

    useEffect(() => {
        if (!id) return;

        async function fetchBookingData() {
            try {
                setIsLoading(true);

                const bookingRes = await fetch(`/api/bookings?id=${id}`);
                if (!bookingRes.ok) throw new Error('Failed to fetch booking');
                const bookingData: Booking[] = await bookingRes.json();
                
                if (bookingData.length === 0) {
                     toast({ variant: 'destructive', title: t('bookingNotFound') });
                     router.push('/my-bookings');
                     return;
                }
                const currentBooking = bookingData[0];
                setBooking(currentBooking);
                
                const locationRes = await fetch(`/api/locations/${currentBooking.locationId}`);
                if (!locationRes.ok) throw new Error('Failed to fetch location');
                const locationData: Location = await locationRes.json();
                setLocation(locationData);

                const allBookingsRes = await fetch(`/api/bookings?locationId=${currentBooking.locationId}`);
                if (!allBookingsRes.ok) throw new Error('Failed to fetch all bookings for location');
                const allBookingsData: Booking[] = await allBookingsRes.json();
                setAllBookingsForLocation(allBookingsData);
                
                const bookingStartDate = new Date(currentBooking.startTime);
                const bookingEndDate = new Date(currentBooking.endTime);
                setDate({ from: bookingStartDate, to: bookingEndDate });

            } catch (error: any) {
                console.error(error);
                toast({ variant: 'destructive', title: "Error", description: error.message });
                router.push('/my-bookings');
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchBookingData();
    }, [id, router, toast, t]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!booking || !location || !date?.from) {
            toast({ variant: 'destructive', title: t('updateFailed'), description: t('missingInfo') });
            return;
        }

        const bookingEndDate = date.to || date.from;
        
        const updatedBookingPayload = {
            startTime: formatISO(startOfDay(date.from)),
            endTime: formatISO(endOfDay(bookingEndDate)),
            status: 'pending', 
        };
        
        try {
             const response = await fetch(`/api/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBookingPayload),
            });
            if (!response.ok) throw new Error('Failed to update booking');

            toast({
                title: t('bookingUpdatedTitle'),
                description: t('bookingUpdatedDescription'),
            });
            router.push('/my-bookings');

        } catch (error: any) {
             toast({ variant: 'destructive', title: "Error", description: error.message });
        }
    };

    const approvedBookedDates = useMemo(() => {
        return allBookingsForLocation
            .filter(b => b.status === 'approved' && b.id !== id)
            .flatMap(b => {
                const start = new Date(b.startTime);
                const end = new Date(b.endTime);
                if (!isValid(start) || !isValid(end)) return [];
                return eachDayOfInterval({ start, end });
            });
    }, [allBookingsForLocation, id]);

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <Skeleton className="h-11 w-full" />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Skeleton className="h-11 w-36" />
                        <Skeleton className="h-11 w-36" />
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!booking || !location) {
        return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4">
            <main className="flex-1 flex items-center justify-center w-full">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{t('rescheduleTitle', { locationName: tloc(location.name as any) })}</CardTitle>
                                <CardDescription>{t('rescheduleDescription_dateOnly')}</CardDescription>
                            </div>
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/my-bookings"><ArrowLeft /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6 pt-6">
                            <div>
                                <Label className="font-medium mb-2 block">{t('selectDateRange')}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                        "w-full justify-start text-left font-normal h-11 bg-background",
                                        !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                {format(date.from, "LLL dd, y")} -{" "}
                                                {format(date.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(date.from, "LLL dd, y")
                                            )
                                            ) : (
                                            <span>{t('pickDateRange')}</span>
                                        )}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="range"
                                        selected={date}
                                        onSelect={setDate}
                                        disabled={(day) => approvedBookedDates.some(bookedDate => format(bookedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')) || day < new Date(new Date().setHours(0,0,0,0)) || day > addDays(new Date(), 60)}
                                        initialFocus
                                        numberOfMonths={2}
                                        modifiers={{ booked: approvedBookedDates }}
                                        modifiersClassNames={{ booked: 'bg-orange-500/80 text-primary-foreground' }}
                                    />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-6">
                            <Button variant="ghost" asChild>
                                <Link href="/my-bookings">{t('backToBookings')}</Link>
                            </Button>
                            <Button type="submit" disabled={!date?.from}>{t('saveChangesButton')}</Button>
                        </CardFooter>
                    </form>
                </Card>
            </main>
        </div>
    );
}

    
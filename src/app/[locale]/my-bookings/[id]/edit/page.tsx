
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { addDays, format, formatISO, getDay, parse, eachDayOfInterval } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = 7 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${String(hour).padStart(2, '0')}:${minute}`;
}).filter(time => time !== '22:30');

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
    const [startTime, setStartTime] = useState<string | null>(null);
    const [endTime, setEndTime] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        async function fetchBookingData() {
            try {
                setIsLoading(true);

                // Fetch the specific booking being edited
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
                
                // Fetch the location details
                const locationRes = await fetch(`/api/locations/${currentBooking.locationId}`);
                if (!locationRes.ok) throw new Error('Failed to fetch location');
                const locationData: Location = await locationRes.json();
                setLocation(locationData);

                // Fetch all bookings for this location to check availability
                const allBookingsRes = await fetch(`/api/bookings?locationId=${currentBooking.locationId}`);
                if (!allBookingsRes.ok) throw new Error('Failed to fetch all bookings for location');
                const allBookingsData: Booking[] = await allBookingsRes.json();
                setAllBookingsForLocation(allBookingsData);
                
                const bookingStartDate = new Date(currentBooking.startTime);
                const bookingEndDate = new Date(currentBooking.endTime);
                setDate({ from: bookingStartDate, to: bookingEndDate });
                setStartTime(format(bookingStartDate, 'HH:mm'));
                setEndTime(format(bookingEndDate, 'HH:mm'));

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

        if (!booking || !location || !date?.from || !startTime || !endTime) {
            toast({ variant: 'destructive', title: t('updateFailed'), description: t('missingInfo') });
            return;
        }

        const bookingEndDate = date.to || date.from;
        
        const updatedBookingPayload = {
            startTime: formatISO(parse(startTime, 'HH:mm', date.from)),
            endTime: formatISO(parse(endTime, 'HH:mm', bookingEndDate)),
            status: 'pending', // Status goes back to pending for admin approval
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

    const selectedDates = useMemo(() => {
        if (!date?.from) return [];
        return eachDayOfInterval({ start: date.from, end: date.to || date.from });
    }, [date]);

    const isTimeSlotUnavailable = useCallback((time: string, checkDate: Date | undefined): boolean => {
        if (!checkDate) return false;
        const day = getDay(checkDate);
        const [hour, minute] = time.split(':').map(Number);
        const totalMinutes = hour * 60 + minute;
        // Example unavailability, adapt as needed
        if (day === 0) { if (totalMinutes >= 420 && totalMinutes < 1020) return true; }
        if (day === 3) { if (totalMinutes >= 1170 && totalMinutes < 1320) return true; }
        if (day === 5) { if (totalMinutes >= 1080 && totalMinutes < 1290) return true; }
        return false;
    }, []);

    const locationBookingsForDay = useCallback((day: Date) => {
        if (!location) return [];
        const formattedDate = format(day, "yyyy-MM-dd");
        return allBookingsForLocation.filter(b => 
            b.id !== id && // Exclude the current booking from checks
            b.locationId === location.id &&
            format(new Date(b.startTime), "yyyy-MM-dd") === formattedDate &&
            b.status === 'approved'
        );
    }, [location, allBookingsForLocation, id]);

    const isTimeSlotBooked = useCallback((time: string, checkDate: Date) => {
        const checkTime = parse(time, 'HH:mm', checkDate).getTime();
        return locationBookingsForDay(checkDate).some(b => {
            const bookingStart = new Date(b.startTime).getTime();
            const bookingEnd = new Date(b.endTime).getTime();
            return checkTime >= bookingStart && checkTime < bookingEnd;
        });
    }, [locationBookingsForDay]);
      
    const isTimeSlotDisabled = useCallback((time: string) => {
        if (selectedDates.length === 0) return true;
        for(const day of selectedDates) {
            if (isTimeSlotBooked(time, day) || isTimeSlotUnavailable(time, day)) {
                return true;
            }
        }
        return false;
    }, [selectedDates, isTimeSlotBooked, isTimeSlotUnavailable]);
    
    const isRangeInvalid = useMemo(() => {
        if(!startTime || !endTime || selectedDates.length === 0) return false;
        const start = parse(startTime, 'HH:mm', new Date());
        const end = parse(endTime, 'HH:mm', new Date());
        for (const day of selectedDates) {
            for (let d = new Date(start); d < end; d.setMinutes(d.getMinutes() + 30)) {
                const timeStr = format(d, 'HH:mm');
                if (isTimeSlotBooked(timeStr, day) || isTimeSlotUnavailable(timeStr, day)) {
                    return true;
                }
            }
        }
        return false;
    }, [startTime, endTime, selectedDates, isTimeSlotBooked, isTimeSlotUnavailable]);
    
    const availableEndTimes = useMemo(() => {
        if (!startTime) return [];
        const startIndex = timeSlots.indexOf(startTime);
        let endIndex = timeSlots.length;
        for (let i = startIndex + 1; i < timeSlots.length; i++) {
            const currentTimeSlot = timeSlots[i];
            let isDisabled = false;
            for (const day of selectedDates) {
                if (isTimeSlotBooked(currentTimeSlot, day) || isTimeSlotUnavailable(currentTimeSlot, day)) {
                    isDisabled = true;
                    break;
                }
            }
            if (isDisabled) {
                endIndex = i;
                break;
            }
        }
        return timeSlots.slice(startIndex + 1, endIndex + 1);
    }, [startTime, isTimeSlotBooked, isTimeSlotUnavailable, selectedDates]);

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
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-11 w-full" />
                            <Skeleton className="h-11 w-full" />
                        </div>
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
                                <CardDescription>{t('rescheduleDescription')}</CardDescription>
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
                                        disabled={(day) => day < new Date(new Date().setHours(0,0,0,0)) || day > addDays(new Date(), 60)}
                                        initialFocus
                                        numberOfMonths={2}
                                    />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label className="font-medium mb-2 block">{t('selectTime')}</Label>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-1">
                                        <Label htmlFor="start-time" className="text-xs">{t('from')}</Label>
                                        <Select value={startTime || ''} onValueChange={setStartTime} disabled={!date?.from}>
                                            <SelectTrigger id="start-time" className="h-11">
                                                <SelectValue placeholder={t('startTime')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map(time => (
                                                    <SelectItem key={time} value={time} disabled={isTimeSlotDisabled(time)}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="end-time" className="text-xs">{t('to')}</Label>
                                        <Select value={endTime || ''} onValueChange={setEndTime} disabled={!startTime}>
                                            <SelectTrigger id="end-time" className="h-11">
                                                <SelectValue placeholder={t('endTime')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableEndTimes.map(time => (
                                                    <SelectItem key={time} value={time}>
                                                    {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {isRangeInvalid && (
                                    <p className="text-sm text-destructive mt-2">{t('rangeInvalid')}</p>
                                )}
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-6">
                            <Button variant="ghost" asChild>
                                <Link href="/my-bookings">{t('backToBookings')}</Link>
                            </Button>
                            <Button type="submit" disabled={isRangeInvalid || !date?.from || !startTime || !endTime}>{t('saveChangesButton')}</Button>
                        </CardFooter>
                    </form>
                </Card>
            </main>
        </div>
    );
}

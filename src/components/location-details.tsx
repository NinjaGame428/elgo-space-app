
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Location } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format, addDays, parse, eachDayOfInterval, formatISO, isValid, setHours, setMinutes } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { useRouter } from 'next/navigation';
import { Clock, Coffee, Printer, Phone, Wifi, Car, UtensilsCrossed, Building } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Booking } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

const amenityIcons = {
  "24/7 Access": Clock,
  "Coffee & Tea": Coffee,
  "Printing": Printer,
  "Phone Booths": Phone,
  "Wi-Fi": Wifi,
  "Kitchenette": UtensilsCrossed,
  "Parking": Car,
};

interface LocationDetailsProps {
  location: Location | null;
}

const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = 7 + i;
    if (hour > 21) return null; // 7am to 9pm
    return `${String(hour).padStart(2, '0')}:00`;
}).filter(Boolean) as string[];

export function LocationDetails({ location }: LocationDetailsProps) {
  const t = useTranslations('LocationDetails');
  const ta = useTranslations('AmenityNames');
  const tloc = useTranslations('LocationNames');
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(60);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dateLocale = locale === 'fr' ? fr : enUS;

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsAuthenticated(loggedIn);
        setUserEmail(localStorage.getItem('userEmail'));
    }
  }, []);

  useEffect(() => {
    setSelectedDate(undefined);
    setSelectedTime(null);

    async function fetchBookings() {
        if (!location) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`/api/bookings?locationId=${location.id}`);
            if (!response.ok) throw new Error("Failed to fetch bookings");
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Could not load booking data for this location." });
        } finally {
            setIsLoading(false);
        }
    }
    fetchBookings();

  }, [location, toast]);


  const handleBooking = async () => {
    if (!isAuthenticated || !userEmail) {
        router.push('/login');
        return;
    }

    if (location && selectedDate && selectedTime) {
      const [hour, minute] = selectedTime.split(':').map(Number);
      const startTime = setMinutes(setHours(selectedDate, hour), minute);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      const newBookingData = {
        locationId: location.id,
        userEmail: userEmail,
        startTime: formatISO(startTime),
        endTime: formatISO(endTime),
      };

      try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBookingData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create booking');
        }

        const newBooking = await response.json();
        setBookings(prev => [...prev, newBooking]);

        toast({
            title: t('bookingConfirmedTitle'),
            description: t('bookingConfirmedDescription', {
              locationName: tloc(location.name as any),
              date: format(selectedDate, "PPP", { locale: dateLocale }),
              startTime: format(startTime, 'p', { locale: dateLocale }),
              endTime: format(endTime, 'p', { locale: dateLocale }),
            }),
        });
        setSelectedDate(undefined);
        setSelectedTime(null);

      } catch (error: any) {
         toast({
            variant: "destructive",
            title: t('bookingFailedTitle'),
            description: error.message || "An unknown error occurred",
        });
      }
    } else {
        toast({
            variant: "destructive",
            title: t('bookingFailedTitle'),
            description: t('bookingFailedDescription'),
        });
    }
  };

  const approvedBookedDates = useMemo(() => {
    return bookings
      .filter(b => b.status === 'approved')
      .flatMap(b => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        if (!isValid(start) || !isValid(end)) return [];
        return eachDayOfInterval({start, end});
      });
  }, [bookings]);


  const isTimeBooked = useCallback((time: string, date: Date) => {
    if (!date) return false;
    const [hour, minute] = time.split(':').map(Number);
    const checkStartTime = setMinutes(setHours(date, hour), minute).getTime();
    const checkEndTime = checkStartTime + duration * 60000;

    return bookings.some(booking => {
        if(booking.status !== 'approved') return false;
        const bookingStart = new Date(booking.startTime).getTime();
        const bookingEnd = new Date(booking.endTime).getTime();
        // Check for any overlap
        return (checkStartTime < bookingEnd) && (checkEndTime > bookingStart);
    });
  }, [bookings, duration]);

  const availableTimeSlots = useMemo(() => {
      if (!selectedDate) return [];
      return timeSlots.filter(time => !isTimeBooked(time, selectedDate));
  }, [selectedDate, isTimeBooked]);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);


  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 animate-fade-in">
        <Building className="w-16 h-16 mb-4 text-muted-foreground" />
        <p className="text-lg font-medium">{t('selectLocation')}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in-up">
        <Card className="w-full max-w-6xl mx-auto overflow-hidden">
            <div className="grid md:grid-cols-2">
                {/* Left Panel */}
                <div className="p-8 border-r flex flex-col gap-8">
                     <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative h-14 w-14 flex-shrink-0">
                                <Image
                                    src={'https://placehold.co/128x128.png'}
                                    alt={tloc(location.name as any)}
                                    fill
                                    className="object-cover rounded-full"
                                    sizes="56px"
                                />
                            </div>
                            <div>
                               <p className="font-semibold">{tloc(location.name as any)}</p>
                               <h2 className="text-2xl font-bold tracking-tight">{t('mainHeading')}</h2>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary text-sm text-secondary-foreground">
                            {t('eventDescription')}
                        </div>
                     </div>
                     <div className="space-y-4 text-sm">
                        <div className="flex items-center gap-3">
                           <Clock className="w-5 h-5 text-muted-foreground"/>
                           <span>{t('duration', {minutes: duration})}</span>
                        </div>
                        {selectedDate && selectedTime && (
                           <div className="flex items-center gap-3">
                               <CalendarIcon className="w-5 h-5 text-muted-foreground"/>
                               <span>{format(setMinutes(setHours(selectedDate, parseInt(selectedTime.split(':')[0])), parseInt(selectedTime.split(':')[1])), 'PPPPp', {locale: dateLocale})}</span>
                           </div>
                        )}
                     </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-4">{t('amenities')}</h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                            {location.amenities.map((amenity) => {
                            const Icon = amenityIcons[amenity.name as keyof typeof amenityIcons] || UtensilsCrossed;
                            return (
                                <div key={amenity.name} className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm">{ta(amenity.name as any)}</span>
                                </div>
                            );
                            })}
                        </div>
                      </div>
                </div>

                {/* Right Panel */}
                <div className="p-8">
                     <h3 className="text-xl font-bold mb-4">{t('selectServiceDate')}</h3>
                     
                     <div className="mb-6">
                        <Label className="font-medium mb-2 block">{t('selectService')}</Label>
                        <Select defaultValue='meeting-room'>
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="meeting-room">{t('meetingRoom')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2 p-3 bg-secondary rounded-lg">
                           <Clock className="w-4 h-4"/>
                           <span>{t('durationInfo', {minutes: duration})}</span>
                        </div>
                     </div>

                     <div>
                        <Label className="font-medium mb-2 block">{t('selectDate')}</Label>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(day) => day < new Date(new Date().setHours(0,0,0,0)) || day > addDays(new Date(), 60)}
                            initialFocus
                            locale={dateLocale}
                        />
                     </div>

                     {selectedDate && (
                        <div className="mt-6">
                            <Label className="font-medium mb-2 block">{t('selectTime')}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {isLoading ? (
                                    Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                                ) : availableTimeSlots.length > 0 ? (
                                    availableTimeSlots.map(time => (
                                        <Button 
                                            key={time} 
                                            variant={selectedTime === time ? 'default' : 'outline'}
                                            onClick={() => setSelectedTime(time)}
                                        >
                                            {time}
                                        </Button>
                                    ))
                                ) : (
                                    <p className="col-span-3 text-muted-foreground text-center p-4">{t('noSlots')}</p>
                                )}
                            </div>
                        </div>
                     )}

                     <Button 
                        onClick={handleBooking} 
                        className="w-full h-11 text-base font-semibold mt-8" 
                        disabled={isLoading || !selectedDate || !selectedTime}
                    >
                        {t('confirmBooking')}
                    </Button>
                </div>
            </div>
        </Card>
    </div>
  );
}

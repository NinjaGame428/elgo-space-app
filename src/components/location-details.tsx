
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
import { format, addDays, parse, eachDayOfInterval, formatISO, isValid, setHours, setMinutes, getDay } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { useRouter } from 'next/navigation';
import { Clock, Coffee, Printer, Phone, Wifi, Car, UtensilsCrossed, Building } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Booking } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';
import { Input } from './ui/input';

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

const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = 7 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    if(hour > 20) return null
    return `${String(hour).padStart(2, '0')}:${minute}`;
}).filter(Boolean) as string[];

export function LocationDetails({ location }: LocationDetailsProps) {
  const t = useTranslations('LocationDetails');
  const ta = useTranslations('AmenityNames');
  const tloc = useTranslations('LocationNames');
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [department, setDepartment] = useState('');
  const [occasion, setOccasion] = useState('');
  
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
    setStartTime(null);
    setEndTime(null);
    setDepartment('');
    setOccasion('');

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

    if (location && selectedDate && startTime && endTime && department && occasion) {
      const startDateTime = parse(startTime, 'HH:mm', selectedDate);
      const endDateTime = parse(endTime, 'HH:mm', selectedDate);
      
      const newBookingData = {
        locationId: location.id,
        userEmail: userEmail,
        startTime: formatISO(startDateTime),
        endTime: formatISO(endDateTime),
        department,
        occasion,
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
              startTime: format(startDateTime, 'p', { locale: dateLocale }),
              endTime: format(endDateTime, 'p', { locale: dateLocale }),
            }),
        });
        
        router.push('/my-bookings');

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
    const checkTime = parse(time, 'HH:mm', date).getTime();
    
    return bookings.some(booking => {
        if(booking.status !== 'approved') return false;
        const bookingStart = new Date(booking.startTime).getTime();
        const bookingEnd = new Date(booking.endTime).getTime();
        return checkTime >= bookingStart && checkTime < bookingEnd;
    });
  }, [bookings]);
  
  const isTimeSlotDisabled = useCallback((time: string) => {
      if (!selectedDate) return true;
      return isTimeBooked(time, selectedDate);
  }, [selectedDate, isTimeBooked]);

  const isRangeInvalid = useMemo(() => {
    if (!startTime || !endTime || !selectedDate) return false;
    const start = parse(startTime, 'HH:mm', new Date());
    const end = parse(endTime, 'HH:mm', new Date());

    for (let d = new Date(start); d < end; d.setMinutes(d.getMinutes() + 30)) {
        const timeStr = format(d, 'HH:mm');
        if (isTimeBooked(timeStr, selectedDate)) {
            return true;
        }
    }
    return false;
  }, [startTime, endTime, selectedDate, isTimeBooked]);
    
  const availableEndTimes = useMemo(() => {
      if (!startTime || !selectedDate) return [];
      const startIndex = timeSlots.indexOf(startTime);
      let endIndex = timeSlots.length;

      for (let i = startIndex + 1; i < timeSlots.length; i++) {
          const currentTimeSlot = timeSlots[i];
          if (isTimeBooked(currentTimeSlot, selectedDate)) {
              endIndex = i;
              break;
          }
      }
      return timeSlots.slice(startIndex + 1, endIndex + 1);
  }, [startTime, selectedDate, isTimeBooked]);


  useEffect(() => {
    setStartTime(null);
    setEndTime(null);
  }, [selectedDate]);

  useEffect(() => {
    setEndTime(null);
  }, [startTime]);

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 animate-fade-in-up">
        <Building className="w-16 h-16 mb-4 text-primary" />
        <p className="text-lg font-medium">{t('selectLocation')}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 animate-fade-in-up">
        <Card className="w-full max-w-6xl mx-auto overflow-hidden">
            <div className="grid md:grid-cols-2">
                <div className="p-6 md:px-8 md:pt-8 md:pb-6 flex flex-col">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{tloc(location.name as any)}</h2>
                        <p className="text-muted-foreground mt-1">{location.address}</p>
                    </div>
                    
                     <div className="mt-6">
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
                      
                       <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">{t('availability')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{t('availabilityHint')}</p>
                            <div className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    modifiers={{ booked: approvedBookedDates }}
                                    modifiersClassNames={{ booked: 'bg-orange-500/80 text-primary-foreground' }}
                                    locale={dateLocale}
                                    disabled={(day) => day < new Date(new Date().setHours(0,0,0,0))}
                                />
                            </div>
                       </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-4 bg-muted/30">
                     <h3 className="text-xl font-bold text-center">{t('bookYourSpace')}</h3>
                     
                     <div className="space-y-4">
                        <div>
                            <Label className="font-medium mb-2 block text-center">{t('selectDate')}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal h-11 bg-background",
                                    !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP", {locale: dateLocale}) : <span>{t('pickDate')}</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    disabled={(day) => day < new Date(new Date().setHours(0,0,0,0)) || day > addDays(new Date(), 60)}
                                    initialFocus
                                    locale={dateLocale}
                                    modifiers={{ booked: approvedBookedDates }}
                                    modifiersClassNames={{ booked: 'bg-orange-500/80 text-primary-foreground' }}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        
                        {selectedDate && (
                            <div className="animate-fade-in-up space-y-4">
                                <div>
                                    <Label className="font-medium mb-2 block text-center">{t('selectTime')}</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select value={startTime || ''} onValueChange={setStartTime} disabled={isLoading || !selectedDate}>
                                            <SelectTrigger className="h-11 bg-background">
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
                                        <Select value={endTime || ''} onValueChange={setEndTime} disabled={isLoading || !startTime}>
                                            <SelectTrigger className="h-11 bg-background">
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
                                    {isRangeInvalid && (
                                        <p className="text-sm text-destructive mt-2 text-center">{t('rangeInvalid')}</p>
                                    )}
                                </div>

                                {startTime && endTime && !isRangeInvalid && (
                                    <div className="animate-fade-in-up space-y-4">
                                        <div>
                                            <Label htmlFor="department" className="font-medium mb-2 block text-center">{t('departmentLabel')}</Label>
                                            <Input 
                                                id="department"
                                                value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                placeholder={t('departmentPlaceholder')}
                                                className="bg-background"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="occasion" className="font-medium mb-2 block text-center">{t('occasionLabel')}</Label>
                                            <Input
                                                id="occasion"
                                                value={occasion}
                                                onChange={(e) => setOccasion(e.target.value)}
                                                placeholder={t('occasionPlaceholder')}
                                                className="bg-background"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                     </div>

                     <Button 
                        onClick={handleBooking} 
                        className="w-full h-12 text-base font-semibold mt-auto"
                        disabled={isLoading || !selectedDate || !startTime || !endTime || !department || !occasion || isRangeInvalid}
                    >
                        {t('confirmBooking')}
                    </Button>
                </div>
            </div>
        </Card>
    </div>
  );
}

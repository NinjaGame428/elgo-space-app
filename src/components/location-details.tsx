
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Location } from '@/lib/types';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format, addDays, parse, getDay, eachDayOfInterval, formatISO, isValid, isAfter } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import type { DateRange } from 'react-day-picker';
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

const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = 7 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${String(hour).padStart(2, '0')}:${minute}`;
}).filter(time => time !== '22:30'); // 7:00 to 22:00

export function LocationDetails({ location }: LocationDetailsProps) {
  const t = useTranslations('LocationDetails');
  const ta = useTranslations('AmenityNames');
  const tloc = useTranslations('LocationNames');
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>();
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
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
    setDate(undefined);
    setStartTime(null);
    setEndTime(null);

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

  useEffect(() => {
    setStartTime(null);
    setEndTime(null);
  }, [date]);

  useEffect(() => {
    setEndTime(null);
  }, [startTime]);

  const handleBooking = async () => {
    if (!isAuthenticated || !userEmail) {
        router.push('/login');
        return;
    }

    if (location && date?.from && startTime && endTime) {
      const bookingEndDate = date.to || date.from;
      
      const newBookingData = {
        locationId: location.id,
        userEmail: userEmail,
        startTime: formatISO(parse(startTime, 'HH:mm', date.from)),
        endTime: formatISO(parse(endTime, 'HH:mm', bookingEndDate)),
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
            startDate: format(date.from, "PPP", { locale: dateLocale }),
            endDate: format(bookingEndDate, "PPP", { locale: dateLocale }),
            startTime: startTime,
            endTime: endTime
            }),
        });
        setDate(undefined);
        setStartTime(null);
        setEndTime(null);

      } catch (error: any) {
         toast({
            variant: "destructive",
            title: t('bookingFailedTitle'),
            description: error.message,
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

  const selectedDates = useMemo(() => {
    if (!date?.from) return [];
    const end = date.to || date.from;
    if (!isValid(date.from) || !isValid(end)) return [];
    return eachDayOfInterval({
        start: date.from,
        end: end,
    });
  }, [date]);

  const locationBookingsForDay = useCallback((day: Date) => {
    if (!isValid(day)) return [];
    const formattedDate = format(day, "yyyy-MM-dd");
    return bookings.filter(b => 
        isValid(new Date(b.startTime)) &&
        format(new Date(b.startTime), "yyyy-MM-dd") === formattedDate &&
        b.status === 'approved'
    );
  }, [bookings]);

  const isTimeSlotBooked = useCallback((time: string, checkDate: Date) => {
    if (!isValid(checkDate)) return false;
    const checkTime = parse(time, 'HH:mm', checkDate).getTime();
    return locationBookingsForDay(checkDate).some(booking => {
        const bookingStart = new Date(booking.startTime).getTime();
        const bookingEnd = new Date(booking.endTime).getTime();
        return checkTime >= bookingStart && checkTime < bookingEnd;
    });
  }, [locationBookingsForDay]);
  
  const isTimeSlotDisabled = useCallback((time: string) => {
    if (selectedDates.length === 0) return true;
    for(const day of selectedDates) {
        if (isTimeSlotBooked(time, day)) {
            return true;
        }
    }
    return false;
  }, [selectedDates, isTimeSlotBooked]);

  const isRangeInvalid = useMemo(() => {
    if(!startTime || !endTime || selectedDates.length === 0) return false;

    const start = parse(startTime, 'HH:mm', new Date());
    const end = parse(endTime, 'HH:mm', new Date());

    for (const day of selectedDates) {
        for (let d = new Date(start); d < end; d.setMinutes(d.getMinutes() + 30)) {
            const timeStr = format(d, 'HH:mm');
            if (isTimeSlotBooked(timeStr, day)) {
                return true;
            }
        }
    }
    return false;
  }, [startTime, endTime, selectedDates, isTimeSlotBooked]);

  const availableEndTimes = useMemo(() => {
    if (!startTime) return [];
    const startIndex = timeSlots.indexOf(startTime);
    let endIndex = timeSlots.length;

    for (let i = startIndex + 1; i < timeSlots.length; i++) {
        const currentTimeSlot = timeSlots[i];
        let isDisabled = false;
        for (const day of selectedDates) {
            if (isTimeSlotBooked(currentTimeSlot, day)) {
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
    
  }, [startTime, isTimeSlotBooked, selectedDates]);

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 animate-fade-in">
        <Building className="w-16 h-16 mb-4 text-muted-foreground" />
        <p className="text-lg font-medium">{t('selectLocation')}</p>
      </div>
    );
  }

  return (
    <div className="h-full">
        <div className="relative w-full h-64">
          <Image
            src={location.imageUrl ?? 'https://placehold.co/800x600.png'}
            alt={tloc(location.name as any)}
            fill
            className="object-cover"
            data-ai-hint="office workspace"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
          />
        </div>
        <div className="p-6 space-y-8">
          <div>
            <h2 className="text-2xl font-bold">{tloc(location.name as any)}</h2>
            <p className="text-base text-muted-foreground pt-1">{location.address}</p>
          </div>
          
          <Card>
              <CardHeader>
                <CardTitle>{t('bookSpot')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-1 gap-4">
                      <div>
                          <Label className="font-medium mb-2 block">{t('selectDateRange')}</Label>
                           <Popover>
                              <PopoverTrigger asChild>
                              <Button
                                  variant={"outline"}
                                  className={cn(
                                  "w-full justify-start text-left font-normal bg-background h-11",
                                  !date && "text-muted-foreground"
                                  )}
                              >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {date?.from ? (
                                      date.to ? (
                                          <>
                                          {format(date.from, "PPP", { locale: dateLocale })} -{" "}
                                          {format(date.to, "PPP", { locale: dateLocale })}
                                          </>
                                      ) : (
                                          format(date.from, "PPP", { locale: dateLocale })
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
                                  locale={dateLocale}
                              />
                              </PopoverContent>
                          </Popover>
                      </div>

                      <div>
                          <Label className="font-medium mb-2 block">{t('selectTime')}</Label>
                          <div className="grid grid-cols-2 gap-4">
                                <Select value={startTime || ''} onValueChange={setStartTime} disabled={!date?.from || isLoading}>
                                    <SelectTrigger className="h-11">
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
                                <Select value={endTime || ''} onValueChange={setEndTime} disabled={!startTime || isLoading}>
                                    <SelectTrigger className="h-11">
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
                              <p className="text-sm text-destructive mt-2">{t('rangeInvalid')}</p>
                          )}
                      </div>
                  </div>
                   <div>
                        <Button onClick={handleBooking} className="w-full h-11 text-base font-semibold" disabled={isLoading || isRangeInvalid || !date?.from || !startTime || !endTime}>
                            {t('bookNow')}
                        </Button>
                    </div>
              </CardContent>
          </Card>

          <Separator />

            <div>
              <h3 className="text-xl font-semibold mb-4">{t('amenities')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                {location.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity.name as keyof typeof amenityIcons] || UtensilsCrossed;
                  return (
                    <div key={amenity.name} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm text-foreground">{ta(amenity.name as any)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator/>

            <div>
              <h3 className="text-xl font-semibold mb-4">{t('availability')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('availabilityDesc')}</p>
              <div className="rounded-lg border">
                {isLoading ? <Skeleton className="w-full h-[300px]" /> :
                    <Calendar
                        mode="multiple"
                        selected={approvedBookedDates}
                        locale={dateLocale}
                        className="p-0"
                        modifiers={{ booked: approvedBookedDates }}
                        modifiersClassNames={{
                            booked: 'bg-orange-500 text-white hover:bg-orange-500/90 focus:bg-orange-500/90',
                        }}
                    />
                }
              </div>
            </div>
            
        </div>
      </div>
  );
}

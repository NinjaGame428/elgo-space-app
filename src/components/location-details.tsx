
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Location } from '@/lib/types';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format, addDays, parse, getDay, eachDayOfInterval } from 'date-fns';
import { bookings } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import type { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';
import { Clock, Coffee, Printer, Phone, Wifi, Car, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>();
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const approvedBookingsForLocation = useMemo(() => {
    if (!location) return [];
    return bookings
      .filter(b => b.status === 'approved' && b.locationId === location.id)
      .flatMap(b => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        return eachDayOfInterval({start, end});
      });
  }, [location]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsAuthenticated(loggedIn);
    }
  }, []);

  useEffect(() => {
    // Reset selections when location changes
    setDate(undefined);
    setStartTime(null);
    setEndTime(null);
  }, [location]);

  useEffect(() => {
    setStartTime(null);
    setEndTime(null);
  }, [date]);

  useEffect(() => {
    setEndTime(null);
  }, [startTime]);

  const handleBooking = () => {
    if (!isAuthenticated) {
        router.push('/login');
        return;
    }

    if (location && date?.from && startTime && endTime) {
      const bookingEndDate = date.to || date.from;
      toast({
        title: t('bookingConfirmedTitle'),
        description: t('bookingConfirmedDescription', {
          locationName: location.name,
          startDate: format(date.from, "PPP"),
          endDate: format(bookingEndDate, "PPP"),
          startTime: startTime,
          endTime: endTime
        }),
      });
    } else {
        toast({
            variant: "destructive",
            title: t('bookingFailedTitle'),
            description: t('bookingFailedDescription'),
        });
    }
  };

  const selectedDates = useMemo(() => {
    if (!date?.from) return [];
    return eachDayOfInterval({
        start: date.from,
        end: date.to || date.from,
    });
  }, [date]);

  const isTimeSlotUnavailable = useCallback((time: string, checkDate: Date | undefined): boolean => {
    if (!checkDate) return false;

    const day = getDay(checkDate);
    const [hour, minute] = time.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;

    if (day === 0) { // Sunday
        if (totalMinutes >= 420 && totalMinutes < 1020) return true;
    }
    if (day === 3) { // Wednesday
        if (totalMinutes >= 1170 && totalMinutes < 1320) return true;
    }
    if (day === 5) { // Friday
        if (totalMinutes >= 1080 && totalMinutes < 1290) return true;
    }

    return false;
  }, []);

  const locationBookingsForDay = useCallback((day: Date) => {
    if (!location) return [];
    const formattedDate = format(day, "yyyy-MM-dd");
    return bookings.filter(b => 
        b.locationId === location.id &&
        format(new Date(b.startTime), "yyyy-MM-dd") === formattedDate &&
        b.status === 'approved'
    );
  }, [location]);

  const isTimeSlotBooked = useCallback((time: string, checkDate: Date) => {
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
        if(isTimeSlotDisabled(timeSlots[i])) {
            endIndex = i;
            break;
        }
    }
    
    return timeSlots.slice(startIndex + 1, endIndex + 1);
    
  }, [startTime, isTimeSlotDisabled]);

  if (!location) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8 bg-card rounded-lg shadow-sm border">
        <p className="text-lg">{t('selectLocation')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className={cn("bg-card rounded-lg")}>
        <div className="relative w-full h-60 md:h-80">
          <Image
            src={location.imageUrl}
            alt={location.name}
            fill
            className="object-cover rounded-t-lg"
            data-ai-hint="office workspace"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-4 md:p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-3xl font-bold">{location.name}</CardTitle>
            <CardDescription className="text-base pt-1">{location.address}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">{t('bookSpot')}</h3>
              <div className="grid md:grid-cols-2 gap-6">
                  <div>
                      <h4 className="font-medium mb-2 text-sm">{t('selectDateRange')}</h4>
                       <Popover>
                          <PopoverTrigger asChild>
                          <Button
                              variant={"outline"}
                              className={cn(
                              "w-full justify-start text-left font-normal bg-background",
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
                      <h4 className="font-medium mb-2 text-sm">{t('selectTime')}</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                              <Label className="text-xs whitespace-nowrap">{t('from')}</Label>
                              <Select value={startTime || ''} onValueChange={setStartTime} disabled={!date?.from}>
                                  <SelectTrigger>
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
                           <div className="flex items-center gap-2">
                              <Label className="text-xs whitespace-nowrap">{t('to')}</Label>
                               <Select value={endTime || ''} onValueChange={setEndTime} disabled={!startTime}>
                                  <SelectTrigger>
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
                  <div className="md:col-span-2">
                    <Button onClick={handleBooking} className="w-full" disabled={isRangeInvalid || !date?.from || !startTime || !endTime}>
                        {t('bookNow')}
                    </Button>
                  </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="text-xl font-semibold mb-4">{t('availability')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('availabilityDesc')}</p>
              <div className="flex justify-center p-4 rounded-lg bg-muted/50">
                <Calendar
                    mode="multiple"
                    selected={approvedBookingsForLocation}
                    className="rounded-md p-0"
                    classNames={{
                        day_selected: "bg-muted-foreground/80 text-muted-foreground hover:bg-muted-foreground/90 focus:bg-muted-foreground/90",
                    }}
                />
              </div>
            </div>
            
            <Separator className="my-6" />
            
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
          </CardContent>
        </div>
      </div>
    </div>
  );
}

    
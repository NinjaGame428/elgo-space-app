
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Location } from '@/lib/types';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Coffee, Info } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format, addDays, parse } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { bookings } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

interface LocationDetailsProps {
  location: Location | null;
}

const timeSlots = Array.from({ length: 9 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`); // 09:00 to 17:00

export function LocationDetails({ location }: LocationDetailsProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Reset times when date changes
    setStartTime(null);
    setEndTime(null);
  }, [date]);

  useEffect(() => {
    // Reset end time if start time changes
    setEndTime(null);
  }, [startTime]);

  const handleBooking = () => {
    if (date && startTime && endTime) {
      toast({
        title: "Booking Confirmed!",
        description: `You have booked ${location?.name} on ${format(date, "PPP")} from ${startTime} to ${endTime}. A reminder will be sent the day before.`,
      });
      // Here you would typically add the new booking to your state/backend
    } else {
        toast({
            variant: "destructive",
            title: "Booking Failed",
            description: "Please select a date, start time, and end time.",
        });
    }
  };

  const locationBookings = useMemo(() => {
    if (!location || !date) return [];
    const formattedDate = format(date, "yyyy-MM-dd");
    return bookings.filter(b => 
        b.locationId === location.id &&
        format(new Date(b.startTime), "yyyy-MM-dd") === formattedDate &&
        b.status === 'approved'
    );
  }, [location, date]);
  
  const isTimeSlotBooked = (time: string) => {
    if (!date) return false;
    const checkTime = parse(time, 'HH:mm', date).getTime();

    return locationBookings.some(booking => {
        const bookingStart = new Date(booking.startTime).getTime();
        const bookingEnd = new Date(booking.endTime).getTime();
        return checkTime >= bookingStart && checkTime < bookingEnd;
    });
  };

  const isRangeBooked = useMemo(() => {
    if(!startTime || !endTime || !date) return false;

    const start = parse(startTime, 'HH:mm', date);
    const end = parse(endTime, 'HH:mm', date);

    for (let d = start; d < end; d.setHours(d.getHours() + 1)) {
        if (isTimeSlotBooked(format(d, 'HH:mm'))) {
            return true;
        }
    }
    return false;
  }, [startTime, endTime, date, isTimeSlotBooked]);


  const availableEndTimes = useMemo(() => {
    if (!startTime) return [];
    const startIndex = timeSlots.indexOf(startTime);
    // Allow booking up to the end of the day. The last slot is bookable as an end time.
    return timeSlots.slice(startIndex + 1).concat([`${parseInt(timeSlots[timeSlots.length-1].split(':')[0]) + 1}:00`]);
  }, [startTime]);


  if (!location) {
    return (
      <div className="hidden lg:flex items-center justify-center h-full text-muted-foreground p-8">
        <p className="text-lg">Select a location to see details</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className={cn("bg-card")}>
        <div className="relative w-full h-60 md:h-80">
          <Image
            src={location.imageUrl}
            alt={location.name}
            fill
            className="object-cover"
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
            <h3 className="text-xl font-semibold mb-4">Book Your Spot</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-medium mb-2">1. Select Date</h4>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || date > addDays(new Date(), 60)}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <div className="mt-4">
                        <h4 className="font-medium mb-2">Public Availability</h4>
                        <Calendar
                            mode="multiple"
                            selected={bookings.filter(b => b.status === 'approved' && b.locationId === location.id).map(b => new Date(b.startTime))}
                            className="rounded-md border p-0"
                            classNames={{
                                day_selected: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/90",
                            }}
                         />
                         <p className="text-xs text-muted-foreground mt-1">Red dates are fully booked.</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium mb-2">2. Select Time</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>From</Label>
                            <Select value={startTime || ''} onValueChange={setStartTime}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Start time" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map(time => (
                                        <SelectItem key={time} value={time} disabled={isTimeSlotBooked(time)}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label>To</Label>
                             <Select value={endTime || ''} onValueChange={setEndTime} disabled={!startTime}>
                                <SelectTrigger>
                                    <SelectValue placeholder="End time" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableEndTimes.map(time => (
                                       <SelectItem key={time} value={time} disabled={isTimeSlotBooked(time) && time !== availableEndTimes[availableEndTimes.length - 1]}>
                                         {time}
                                       </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     {isRangeBooked && (
                        <p className="text-sm text-destructive mt-2">Part of this time range is already booked.</p>
                    )}

                    <Button onClick={handleBooking} className="w-full mt-6" disabled={!date || !startTime || !endTime || isRangeBooked}>
                      Book Now
                    </Button>
                </div>
            </div>

            <Separator className="my-6" />
            
            <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Friendly Reminder</AlertTitle>
                <AlertDescription>
                    Please leave the room clean and tidy for the next person. Thank you!
                </AlertDescription>
            </Alert>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {location.amenities.map((amenity) => (
                  <div key={amenity.name} className="flex items-center gap-3">
                    <amenity.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm text-foreground">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </ScrollArea>
  );
}

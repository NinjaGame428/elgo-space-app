
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Booking, Location } from '@/lib/types';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock, Coffee, Printer, Phone, Wifi, Car, UtensilsCrossed } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format, addDays } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Info } from 'lucide-react';
import { bookings } from '@/lib/data';

interface LocationDetailsProps {
  location: Location | null;
}

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function LocationDetails({ location }: LocationDetailsProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBooking = () => {
    if (date && selectedTime) {
      toast({
        title: "Booking Confirmed!",
        description: `You have booked ${location?.name} on ${format(date, "PPP")} at ${selectedTime}. A reminder will be sent the day before.`,
      });
    } else {
        toast({
            variant: "destructive",
            title: "Booking Failed",
            description: "Please select a date and time.",
        });
    }
  };

  const locationBookings = useMemo(() => {
    if (!location) return [];
    return bookings.filter(b => b.locationId === location.id);
  }, [location]);

  const isTimeSlotBooked = (time: string) => {
    if (!date) return false;
    return locationBookings.some(booking => {
        const bookingDate = new Date(booking.startTime);
        return format(bookingDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
               bookingDate.getHours() === parseInt(time.split(':')[0]) &&
               booking.status === 'approved';
    });
  }

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
                            disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <div className="mt-4">
                        <h4 className="font-medium mb-2">Public Availability</h4>
                        <Calendar
                            mode="multiple"
                            selected={locationBookings.filter(b => b.status === 'approved').map(b => new Date(b.startTime))}
                            className="rounded-md border p-0"
                            classNames={{
                                day_selected: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/90",
                            }}
                         />
                         <p className="text-xs text-muted-foreground mt-1">Red dates are fully booked.</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium mb-2">2. Select Time (1hr slots)</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map(time => (
                            <Button
                                key={time}
                                variant={isTimeSlotBooked(time) ? 'destructive' : selectedTime === time ? 'default' : 'outline'}
                                disabled={isTimeSlotBooked(time)}
                                onClick={() => setSelectedTime(time)}
                            >
                                {time}
                            </Button>
                        ))}
                    </div>

                    <Button onClick={handleBooking} className="w-full mt-6" disabled={!date || !selectedTime}>
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

'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { Location } from '@/lib/types';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface LocationDetailsProps {
  location: Location | null;
}

export function LocationDetails({ location }: LocationDetailsProps) {
  if (!location) {
    return (
      <div className="hidden lg:flex items-center justify-center h-full text-muted-foreground p-8">
        <p className="text-lg">Select a location to see details</p>
      </div>
    );
  }

  const defaultTab = location.bookables.length > 0 ? location.bookables[0].type : '';

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
            {location.bookables.length > 0 && (
              <>
                <h3 className="text-xl font-semibold mb-4">Book Your Spot</h3>
                <Tabs defaultValue={defaultTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    {location.bookables.map((item) => (
                      <TabsTrigger key={item.type} value={item.type}>{item.type}</TabsTrigger>
                    ))}
                  </TabsList>
                  {location.bookables.map((item) => (
                    <TabsContent key={item.type} value={item.type}>
                      <div className="p-4 border rounded-lg bg-background">
                        <p className="text-foreground/80 mb-4">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold">{item.price}</p>
                          <Button>Book Now</Button>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                <Separator className="my-6" />
              </>
            )}

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

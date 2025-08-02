
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { locations as allLocations } from '@/lib/data';
import type { Location } from '@/lib/types';
import { LocationCard } from '@/components/location-card';
import { LocationDetails } from '@/components/location-details';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';


export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookableFilter, setBookableFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(allLocations[0]);
  const isMobile = useIsMobile();

  const filteredLocations = useMemo(() => {
    return allLocations.filter((location) => {
      const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBookable = bookableFilter === 'all' || location.bookables.some(b => b.type.toLowerCase().replace(/ /g, '') === bookableFilter);
      return matchesSearch && matchesBookable;
    });
  }, [searchQuery, bookableFilter]);
  
  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
  };

  const showDetails = isMobile && selectedLocation;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 lg:grid lg:grid-cols-[480px_1fr]">
          <aside className={cn("lg:border-r border-border flex-col h-full", isMobile && showDetails ? "hidden" : "flex")}>
            <div className="p-4 border-b bg-card">
              <h1 className="text-2xl font-bold mb-4">Locations</h1>
              <div className="flex gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search locations..."
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={bookableFilter} onValueChange={setBookableFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Bookable Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="meetingroom">Meeting Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {filteredLocations.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 p-4">
                    {filteredLocations.map((location) => (
                      <LocationCard
                        key={location.id}
                        location={location}
                        isSelected={!isMobile && selectedLocation?.id === location.id}
                        onClick={() => handleSelectLocation(location)}
                      />
                    ))}
                  </div>
              ) : (
                  <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
                      <p>No locations found.</p>
                  </div>
              )}
            </ScrollArea>
          </aside>

          <section className={cn("flex-1 flex flex-col h-full", isMobile && !showDetails ? "hidden" : "flex")}>
              {isMobile && showDetails && (
                  <div className="p-2 border-b bg-card">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLocation(null)}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to list
                      </Button>
                  </div>
              )}
            <LocationDetails location={selectedLocation} />
          </section>
        </div>
      </main>
    </div>
  );
}

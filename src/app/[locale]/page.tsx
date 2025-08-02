
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { locations as allLocations } from '@/lib/data';
import type { Location } from '@/lib/types';
import { LocationCard } from '@/components/location-card';
import { LocationDetails } from '@/components/location-details';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookableFilter, setBookableFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!selectedLocation && allLocations.length > 0) {
      setSelectedLocation(allLocations[0]);
    }
  }, [selectedLocation, allLocations]);

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

  return (
    <div className="flex flex-col min-h-screen bg-background/80 backdrop-blur-sm">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-[1fr,1.2fr] lg:gap-8">
          
          <div className="flex flex-col gap-6">
            <div className="p-4 border bg-card rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold mb-4">{t('locations')}</h1>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={t('searchPlaceholder')}
                      className="pl-10 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={bookableFilter} onValueChange={setBookableFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder={t('allTypes')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allTypes')}</SelectItem>
                      <SelectItem value="meetingroom">{t('meetingRoom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>

            {filteredLocations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                  {filteredLocations.map((location) => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      isSelected={selectedLocation?.id === location.id}
                      onClick={() => handleSelectLocation(location)}
                    />
                  ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full p-8 text-muted-foreground bg-card rounded-lg">
                    <p>{t('noLocationsFound')}</p>
                </div>
            )}
          </div>

          <div className="hidden lg:block sticky top-24 self-start">
            <LocationDetails location={selectedLocation} />
          </div>

        </div>
      </main>
    </div>
  );
}

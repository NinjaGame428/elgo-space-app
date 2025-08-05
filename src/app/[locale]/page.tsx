
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LocationCard } from '@/components/location-card';
import { LocationDetails } from '@/components/location-details';
import type { Location } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { getLocations } from '@/lib/supabase/server';


export default function HomePage() {
  const t = useTranslations('Home');
  const tloc = useTranslations('LocationNames');
  const searchParams = useSearchParams();

  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        // Since this is a client component, we can't directly call a server function.
        // In a real app, you'd fetch from an API route. For this demo, we'll mimic that.
        // This is a temporary solution to make it work.
        const response = await fetch('/api/locations');
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        const locationsData: Location[] = await response.json();
        
        setAllLocations(locationsData);
        setFilteredLocations(locationsData);

        const initialLocationId = searchParams.get('location');
        const initialLocation = locationsData.find(l => l.id === initialLocationId) || locationsData[0];
        setSelectedLocation(initialLocation);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, [searchParams]);

  useEffect(() => {
    const filtered = allLocations.filter(location => {
      const locationName = tloc(location.name as any) || location.name;
      const matchesSearch = locationName.toLowerCase().includes(searchTerm.toLowerCase());
      // The type filter is static for now as we only have 'Meeting Room'
      const matchesType = selectedType === 'All Types' || selectedType === 'Meeting Room';
      return matchesSearch && matchesType;
    });
    setFilteredLocations(filtered);
  }, [searchTerm, selectedType, allLocations, tloc]);


  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  if (loading) {
    return (
      <main className="flex-1 grid md:grid-cols-2 gap-8 py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="p-4 space-y-4 border rounded-lg bg-card shadow-sm">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
        <div className="sticky top-24 self-start">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </main>
    );
  }

  return (
      <main className="flex-1 grid md:grid-cols-2 gap-8 py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="p-4 space-y-4 border rounded-lg bg-card shadow-sm">
            <h2 className="text-2xl font-bold">{t('locations')}</h2>
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">{t('allTypes')}</SelectItem>
                <SelectItem value="Meeting Room">{t('meetingRoom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            {filteredLocations.length > 0 ? (
              filteredLocations.map(location => (
                <LocationCard
                  key={location.id}
                  location={location}
                  isSelected={selectedLocation?.id === location.id}
                  onClick={() => handleLocationSelect(location)}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">{t('noLocationsFound')}</p>
            )}
          </div>
        </div>
        
        <div className="sticky top-24 self-start">
            <LocationDetails location={selectedLocation} />
        </div>
      </main>
  );
}


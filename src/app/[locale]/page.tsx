
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
import { Search, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';


export default function HomePage() {
  const t = useTranslations('Home');
  const tloc = useTranslations('LocationNames');
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/locations');
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        const locationsData: Location[] = await response.json();
        
        setAllLocations(locationsData);
        setFilteredLocations(locationsData);

        const initialLocationId = searchParams.get('location');
        const initialLocation = locationsData.find(l => l.id === initialLocationId);

        if (initialLocation) {
          setSelectedLocation(initialLocation);
        } else if (!isMobile && locationsData.length > 0) {
            setSelectedLocation(locationsData[0]);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isMobile]);

  useEffect(() => {
    const filtered = allLocations.filter(location => {
      const locationName = tloc(location.name as any) || location.name;
      const matchesSearch = locationName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'All Types' || (location.bookables?.some(b => b.type === selectedType));
      return matchesSearch && matchesType;
    });
    setFilteredLocations(filtered);
  }, [searchTerm, selectedType, allLocations, tloc]);


  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };
  
  const LocationList = () => (
    <div className="flex flex-col border-r bg-card h-full">
      <div className="p-4 space-y-4 border-b">
        <h2 className="text-xl font-bold">{t('locations')}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-background"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="h-11 bg-background">
            <SelectValue placeholder={t('allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Types">{t('allTypes')}</SelectItem>
            <SelectItem value="Meeting Room">{t('meetingRoom')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
            {loading ? (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
            </div>
            ) : filteredLocations.length > 0 ? (
            filteredLocations.map(location => (
                <LocationCard
                key={location.id}
                location={location}
                isSelected={selectedLocation?.id === location.id}
                onClick={() => handleLocationSelect(location)}
                />
            ))
            ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                <p className="text-lg font-medium">{t('noLocationsFound')}</p>
                <p className="text-sm text-muted-foreground">{t('noLocationsFoundHint')}</p>
            </div>
            )}
        </div>
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    if (selectedLocation) {
        return (
            <main className="h-[calc(100vh-5rem)]">
                <ScrollArea className="h-full">
                    <div className="p-4">
                        <Button variant="ghost" onClick={() => setSelectedLocation(null)} className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('backToLocations')}
                        </Button>
                    </div>
                    <LocationDetails location={selectedLocation} />
                </ScrollArea>
            </main>
        )
    }
    return (
        <main className="h-[calc(100vh-5rem)]">
            <LocationList />
        </main>
    )
  }

  return (
    <main className="grid md:grid-cols-[380px_1fr] h-[calc(100vh-5rem)]">
        <LocationList />
        <ScrollArea className="h-full">
            <LocationDetails location={selectedLocation} />
        </ScrollArea>
    </main>
  );
}

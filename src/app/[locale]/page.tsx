
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
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';


export default function HomePage() {
  const t = useTranslations('Home');
  const tloc = useTranslations('LocationNames');
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
        if (initialLocationId) {
            const initialLocation = locationsData.find(l => l.id === initialLocationId);
            if (initialLocation) {
              handleLocationSelect(initialLocation);
            }
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    if (isMobile) {
      setIsSheetOpen(true);
    }
  };
  
  const LocationList = () => (
    <div className="flex flex-col border-r border-border/60 h-full">
      <div className="p-4 space-y-4 border-b border-border/60">
        <h2 className="text-xl font-bold">{t('locations')}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder={t('allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Types">{t('allTypes')}</SelectItem>
            <SelectItem value="Meeting Room">{t('meetingRoom')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 p-4 overflow-y-auto flex-1">
        {loading ? (
          <div className="space-y-4 pt-4 overflow-y-auto">
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
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <main className="h-[calc(100vh-5rem)]">
          <LocationList />
        </main>
        <SheetContent side="bottom" className="h-[95vh] flex flex-col p-0">
           <SheetHeader className="p-4 border-b">
              <SheetTitle>{selectedLocation ? tloc(selectedLocation.name as any) : t('selectLocation')}</SheetTitle>
            </SheetHeader>
          <div className="overflow-y-auto flex-1">
            <LocationDetails location={selectedLocation} />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <main className="grid md:grid-cols-[380px_1fr] h-[calc(100vh-5rem)]">
        <LocationList />
        <div className="overflow-y-auto">
            <LocationDetails location={selectedLocation} />
        </div>
    </main>
  );
}

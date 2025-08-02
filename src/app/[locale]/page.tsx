
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { LocationCard } from '@/components/location-card';
import { LocationDetails } from '@/components/location-details';
import { locations as allLocations } from '@/lib/data';
import type { Location } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Home');
  const searchParams = useSearchParams();
  const initialLocationId = searchParams.get('location');
  const initialLocation = allLocations.find(l => l.id === initialLocationId) || allLocations[0];

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');

  const filteredLocations = allLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All Types' || location.bookables.some(b => b.type === selectedType);
    return matchesSearch && matchesType;
  });

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 grid md:grid-cols-2 gap-8 p-4 md:p-6">
        <div className="flex flex-col">
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
          <div className="space-y-4 mt-6">
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
    </div>
  );
}

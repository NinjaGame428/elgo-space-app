
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
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HomePage() {
  const searchParams = useSearchParams();
  const initialLocationId = searchParams.get('location');
  const initialLocation = allLocations.find(l => l.id === initialLocationId) || null;

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
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 grid md:grid-cols-[2fr_3fr] xl:grid-cols-[1fr_2fr] overflow-hidden">
        <div className="flex flex-col border-r">
          <div className="p-4 space-y-4 border-b">
            <h2 className="text-2xl font-bold">Locations</h2>
            <Input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Meeting Room">Meeting Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
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
                <p className="text-muted-foreground text-center py-8">No locations found.</p>
              )}
            </div>
          </ScrollArea>
        </div>
        <ScrollArea className="flex-1">
            <div className="p-4 md:p-6">
                <LocationDetails location={selectedLocation} />
            </div>
        </ScrollArea>
      </main>
    </div>
  );
}

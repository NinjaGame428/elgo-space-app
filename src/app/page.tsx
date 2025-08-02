
'use client';

import React, { useState, useMemo } from 'react';
import { locations as allLocations } from '@/lib/data';
import type { Location } from '@/lib/types';
import { LocationCard } from '@/components/location-card';
import { LocationDetails } from '@/components/location-details';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ArrowLeft, User, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookableFilter, setBookableFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(allLocations[0]);
  const isMobile = useIsMobile();
  const router = useRouter();
  
  // A simple mock for user authentication state. In a real app, this would come from a context or auth store.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // This would be replaced by a real check
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsAuthenticated(loggedIn);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
    router.push('/');
  };


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
    <main className="flex h-screen w-full bg-background">
      <div className="flex-1 lg:grid lg:grid-cols-[480px_1fr]">
        <aside className={cn("lg:border-r border-border flex-col h-screen", isMobile && showDetails ? "hidden" : "flex")}>
          <header className="p-4 border-b bg-card">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Locations</h1>
               {isAuthenticated ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Open user menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/">All Spaces</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/my-bookings">My Bookings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
               ) : (
                <Button asChild variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
               )}
            </div>
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
          </header>

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

        <section className={cn("flex-1 flex flex-col h-screen", isMobile && !showDetails ? "hidden" : "flex")}>
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
  );
}


'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Location } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  onClick: () => void;
}

export function LocationCard({ location, isSelected, onClick }: LocationCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md border-2',
        isSelected ? 'border-primary shadow-md' : 'border-card hover:border-primary/50'
      )}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-48 sm:h-auto sm:w-48 flex-shrink-0">
          <Image
            src={location.imageUrl}
            alt={location.name}
            fill
            className="object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
            data-ai-hint="modern office"
            sizes="(max-width: 640px) 100vw, 192px"
          />
        </div>
        <div className="p-4 flex flex-col">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-bold mb-1 truncate">{location.name}</CardTitle>
            <CardDescription className="truncate">{location.address}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-auto pt-4">
            <div className="flex flex-wrap gap-2">
                {location.bookables.map(b => (
                    <Badge key={b.type} variant="secondary">{b.type}</Badge>
                ))}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

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
        isSelected ? 'border-primary' : 'border-transparent'
      )}
    >
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={location.imageUrl}
            alt={location.name}
            fill
            className="object-cover rounded-t-lg"
            data-ai-hint="modern office"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold mb-1 truncate">{location.name}</CardTitle>
        <CardDescription className="truncate">{location.address}</CardDescription>
        <div className="flex flex-wrap gap-2 mt-3">
            {location.bookables.map(b => (
                <Badge key={b.type} variant="secondary">{b.type}</Badge>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

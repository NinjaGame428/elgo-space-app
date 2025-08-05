
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Location } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { useTranslations } from 'next-intl';

interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  onClick: () => void;
}

export function LocationCard({ location, isSelected, onClick }: LocationCardProps) {
  const t = useTranslations('LocationNames');
  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all duration-200 border-2 border-transparent',
        isSelected ? 'border-primary bg-muted/50' : 'hover:bg-muted/50'
      )}
    >
      <div className="flex items-center p-3 gap-4">
        <div className="relative h-20 w-20 flex-shrink-0">
          <Image
            src={location.imageUrl || 'https://placehold.co/300x300.png'}
            alt={t(location.name as any)}
            fill
            className="object-cover rounded-md"
            data-ai-hint="modern office"
            sizes="80px"
          />
        </div>
        <div className="flex-1 overflow-hidden">
            <h3 className="text-base font-semibold truncate">{t(location.name as any)}</h3>
            <p className="text-sm text-muted-foreground truncate">{location.address}</p>
            <div className="flex flex-wrap gap-2 mt-2">
                {location.bookables?.map(b => (
                    <Badge key={b.type} variant="secondary">{b.type}</Badge>
                ))}
            </div>
        </div>
      </div>
    </Card>
  );
}

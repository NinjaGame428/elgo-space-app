import type { ElementType } from 'react';

export interface Amenity {
  name: string;
  icon: ElementType;
}

export interface BookableItem {
  type: 'Desk' | 'Office' | 'Meeting Room';
  description: string;
  price: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  bookables: BookableItem[];
  amenities: Amenity[];
}

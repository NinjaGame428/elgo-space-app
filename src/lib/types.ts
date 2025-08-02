
import type { ElementType } from 'react';

export interface Amenity {
  name: string;
  icon?: ElementType; // Icon is optional now
}

export interface BookableItem {
  type: 'Desk' | 'Office' | 'Meeting Room';
  description: string;
  price: string;
}

export interface Location {
  id: string;
  name:string;
  address: string;
  imageUrl: string;
  bookables: BookableItem[];
  amenities: Omit<Amenity, 'icon'>[];
}

export interface Booking {
  id: string;
  locationId: string;
  userEmail: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  joined: string;
}


import type { ElementType } from 'react';

export interface Amenity {
  id: number;
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
  imageUrl: string | null;
  bookables?: BookableItem[]; // Make optional as it's not in the DB
  amenities: Amenity[];
}

export interface Booking {
  id: string;
  locationId: string;
  userEmail: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected';
  department?: string;
  occasion?: string;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: 'Admin' | 'User';
  joined_at: string;
}

export interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    created_at: string;
    updated_at: string;
}

export interface Conversation {
    id: string;
    user_id: string;
    admin_id: string | null;
    status: 'open' | 'closed';
    created_at: string;
    updated_at: string;
    user: User;
    admin: User | null;
}

export interface Message {
    id: number;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

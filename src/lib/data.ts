
import type { Location, Booking } from '@/lib/types';
import { Clock, Coffee, Printer, Phone, Wifi, Car, UtensilsCrossed } from 'lucide-react';
import { addHours, formatISO } from 'date-fns';

const today = new Date();
const tomorrow = addHours(new Date(), 24);

export const locations: Location[] = [
  {
    id: 'secretariat',
    name: 'Secretariat',
    address: '717 Boul St Joseph, Gatineau, QC',
    imageUrl: 'https://placehold.co/800x600.png',
    bookables: [
      {
        type: 'Meeting Room',
        description: 'A professional meeting room for up to 5 people. Ideal for small team meetings or client presentations.',
        price: '$50/hour',
      },
    ],
    amenities: [
      { name: '24/7 Access', icon: Clock },
      { name: 'Coffee & Tea', icon: Coffee },
      { name: 'Printing', icon: Printer },
      { name: 'Phone Booths', icon: Phone },
      { name: 'Wi-Fi', icon: Wifi },
    ],
  },
  {
    id: 'sanctuaire',
    name: 'Sanctuaire',
    address: '717 Boul St Joseph, Gatineau, QC',
    imageUrl: 'https://placehold.co/800x600.png',
    bookables: [
      {
        type: 'Meeting Room',
        description: 'A large event space that can accommodate up to 200 people. Perfect for conferences, workshops, or large gatherings.',
        price: '$500/hour',
      },
    ],
    amenities: [
      { name: 'Coffee & Tea', icon: Coffee },
      { name: 'Wi-Fi', icon: Wifi },
      { name: 'Kitchenette', icon: UtensilsCrossed },
      { name: 'Parking', icon: Car },
    ],
  },
  {
    id: 'integration',
    name: 'Integration',
    address: '717 Boul St Joseph, Gatineau, QC',
    imageUrl: 'https://placehold.co/800x600.png',
    bookables: [
      {
        type: 'Meeting Room',
        description: 'A versatile room for up to 20 people. Great for team integrations, training sessions, and workshops.',
        price: '$80/hour',
      },
    ],
    amenities: [
      { name: 'Coffee & Tea', icon: Coffee },
      { name: 'Printing', icon: Printer },
      { name: 'Wi-Fi', icon: Wifi },
    ],
  },
  {
    id: 'impact-junior',
    name: 'Impact Junior',
    address: '717 Boul St Joseph, Gatineau, QC',
    imageUrl: 'https://placehold.co/800x600.png',
    bookables: [
      {
        type: 'Meeting Room',
        description: 'A cozy space for up to 15 people, designed for impactful brainstorming and collaborative sessions for smaller teams.',
        price: '$60/hour',
      },
    ],
    amenities: [
      { name: 'Coffee & Tea', icon: Coffee },
      { name: 'Wi-Fi', icon: Wifi },
      { name: 'Kitchenette', icon: UtensilsCrossed },
    ],
  },
];

export const bookings: Booking[] = [
    {
        id: 'booking-1',
        locationId: 'secretariat',
        userEmail: 'user1@example.com',
        startTime: formatISO(addHours(new Date(today.setHours(10, 0, 0, 0)), 0)),
        endTime: formatISO(addHours(new Date(today.setHours(10, 0, 0, 0)), 1)),
        status: 'approved'
    },
    {
        id: 'booking-2',
        locationId: 'integration',
        userEmail: 'user2@example.com',
        startTime: formatISO(addHours(new Date(today.setHours(14, 0, 0, 0)), 0)),
        endTime: formatISO(addHours(new Date(today.setHours(14, 0, 0, 0)), 2)),
        status: 'pending'
    },
     {
        id: 'booking-3',
        locationId: 'sanctuaire',
        userEmail: 'user3@example.com',
        startTime: formatISO(addHours(new Date(tomorrow.setHours(11, 0, 0, 0)), 0)),
        endTime: formatISO(addHours(new Date(tomorrow.setHours(11, 0, 0, 0)), 3)),
        status: 'approved'
    },
     {
        id: 'booking-4',
        locationId: 'secretariat',
        userEmail: 'user4@example.com',
        startTime: formatISO(addHours(new Date(tomorrow.setHours(15, 0, 0, 0)), 0)),
        endTime: formatISO(addHours(new Date(tomorrow.setHours(15, 0, 0, 0)), 1)),
        status: 'rejected'
    }
];

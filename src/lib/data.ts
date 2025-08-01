import type { Location } from '@/lib/types';
import { Clock, Coffee, Printer, Phone, Wifi, Car, UtensilsCrossed } from 'lucide-react';

export const locations: Location[] = [
  {
    id: 'plateau',
    name: 'Lauft - Plateau',
    address: '123 Mont-Royal Ave, Montreal, QC',
    imageUrl: 'https://placehold.co/800x600.png',
    bookables: [
      {
        type: 'Desk',
        description: 'A dedicated desk for the day. Perfect for focusing and getting work done.',
        price: '$35/day',
      },
      {
        type: 'Office',
        description: 'A private office for you or your team. Available for daily or monthly rental.',
        price: '$150/day',
      },
      {
        type: 'Meeting Room',
        description: 'Book our state-of-the-art meeting room for your next presentation or team sync.',
        price: '$75/hour',
      },
    ],
    amenities: [
      { name: '24/7 Access', icon: Clock },
      { name: 'Coffee & Tea', icon: Coffee },
      { name: 'Printing', icon: Printer },
      { name: 'Phone Booths', icon: Phone },
      { name: 'Wi-Fi', icon: Wifi },
      { name: 'Parking', icon: Car },
    ],
  },
  {
    id: 'downtown',
    name: 'Lauft - Downtown Core',
    address: '456 Sainte-Catherine St, Montreal, QC',
    imageUrl: 'https://placehold.co/800x600.png',
    bookables: [
      {
        type: 'Desk',
        description: 'A hot desk in our vibrant open-plan space. Grab any available spot.',
        price: '$30/day',
      },
       {
        type: 'Meeting Room',
        description: 'Collaborate in our fully-equipped meeting rooms. Whiteboards and projectors included.',
        price: '$70/hour',
      },
    ],
    amenities: [
      { name: 'Coffee & Tea', icon: Coffee },
      { name: 'Printing', icon: Printer },
      { name: 'Wi-Fi', icon: Wifi },
      { name: 'Kitchenette', icon: UtensilsCrossed },
    ],
  },
  {
    id: 'old-port',
    name: 'Lauft - Old Port',
    address: '789 de la Commune St, Montreal, QC',
    imageUrl: 'https://placehold.co/800x600.png',
    bookables: [
      {
        type: 'Desk',
        description: 'A dedicated desk with a view of the Old Port. Power and USB ports at every desk.',
        price: '$40/day',
      },
      {
        type: 'Office',
        description: 'A premium private office with stunning views. Impress your clients.',
        price: '$200/day',
      },
    ],
    amenities: [
      { name: '24/7 Access', icon: Clock },
      { name: 'Premium Coffee', icon: Coffee },
      { name: 'Wi-Fi', icon: Wifi },
      { name: 'Parking', icon: Car },
    ],
  },
    {
    id: 'griffintown',
    name: 'Lauft - Griffintown',
    address: '101 Peel St, Montreal, QC',
    imageUrl: 'https://placehold.co/800x600.png',
    bookables: [
      {
        type: 'Desk',
        description: 'A flexible hot desk in our newest creative hub. Surrounded by startups and artists.',
        price: '$32/day',
      },
       {
        type: 'Meeting Room',
        description: 'Brainstorm in our creative meeting spaces. Bean bags and writable walls.',
        price: '$65/hour',
      },
    ],
    amenities: [
      { name: 'Coffee & Tea', icon: Coffee },
      { name: 'Printing', icon: Printer },
      { name: 'Wi-Fi', icon: Wifi },
      { name: 'Kitchenette', icon: UtensilsCrossed },
    ],
  },
];

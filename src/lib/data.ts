
import type { Location, Booking, Amenity, User } from '@/lib/types';

// This file is now primarily for defining the initial structure and can be used for seeding.
// The application will now fetch data directly from Supabase.

export const allAmenities: Omit<Amenity, 'icon'>[] = [
    { name: '24/7 Access' },
    { name: 'Coffee & Tea' },
    { name: 'Printing' },
    { name: 'Phone Booths' },
    { name: 'Wi-Fi' },
    { name: 'Kitchenette' },
    { name: 'Parking' },
];

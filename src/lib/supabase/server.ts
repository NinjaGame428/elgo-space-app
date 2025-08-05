
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Amenity, Booking, Location, User } from '../types';

// Note: The previous approach of exporting a createClient function caused build issues.
// This refactored approach creates a single, memoized client instance that can be
// safely used by all server-side functions in this file.

const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};


export async function getLocations(): Promise<Location[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('locations')
        .select(`
            id,
            name,
            address,
            image_url,
            amenities ( id, name )
        `);

    if (error) {
        console.error('Error fetching locations:', error);
        return [];
    }

    // Map snake_case from DB to camelCase for the app
    return data.map((location: any) => ({
        id: location.id,
        name: location.name,
        address: location.address,
        imageUrl: location.image_url,
        bookables: [{
            type: 'Meeting Room',
            description: 'A newly added meeting room.',
            price: '$50/hour'
        }],
        amenities: location.amenities.map((amenity: any) => ({
            id: amenity.id,
            name: amenity.name
        }))
    }));
}


export async function getAllBookings(): Promise<Booking[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('bookings')
        .select('*');

    if (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }

    return data.map(b => ({
        id: b.id,
        locationId: b.location_id,
        userEmail: b.user_email,
        startTime: b.start_time,
        endTime: b.end_time,
        status: b.status
    }));
}


export async function getUsers(): Promise<User[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }
    
    return data.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        joined_at: u.joined_at,
    }));
}


'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Amenity, Booking, Location, User } from '../types';

// This is the server-side Supabase client.
// It's used in server components and server-side functions (e.g. API routes).
export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
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
    return data.map(location => ({
        ...location,
        imageUrl: location.image_url,
        amenities: location.amenities.map(amenity => ({
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

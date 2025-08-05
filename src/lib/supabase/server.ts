
'use server';

import { createClient } from './server-client';
import type { Booking, Location, User } from '../types';

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
        address: "717 Bd Saint-Joseph, Gatineau, QC J8Y 4B6",
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
        status: b.status,
        department: b.department,
        occasion: b.occasion,
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
        phone: u.phone,
        role: u.role,
        joined_at: u.joined_at,
    }));
}

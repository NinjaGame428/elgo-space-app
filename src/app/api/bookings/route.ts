
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// GET bookings, optionally filtered by locationId or userEmail
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('locationId');
    const userEmail = searchParams.get('userEmail');

    try {
        const supabase = createClient();
        let query = supabase.from('bookings').select('*');

        if (locationId) {
            query = query.eq('location_id', locationId);
        }

        if (userEmail) {
            query = query.eq('user_email', userEmail);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("API Error fetching bookings:", error);
        return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 });
    }
}


// POST a new booking
export async function POST(req: NextRequest) {
    try {
        const { locationId, userEmail, startTime, endTime } = await req.json();

        if (!locationId || !userEmail || !startTime || !endTime) {
            return NextResponse.json({ message: 'Missing required booking fields' }, { status: 400 });
        }
        
        const supabase = createClient();

        const newBooking = {
            id: `booking-${uuidv4()}`,
            location_id: locationId,
            user_email: userEmail,
            start_time: startTime,
            end_time: endTime,
            status: 'pending' // Default status
        };

        const { data, error } = await supabase
            .from('bookings')
            .insert(newBooking)
            .select()
            .single();

        if (error) throw error;
        
        // Map back to camelCase for the client
        const responseData = {
            id: data.id,
            locationId: data.location_id,
            userEmail: data.user_email,
            startTime: data.start_time,
            endTime: data.end_time,
            status: data.status
        };

        return NextResponse.json(responseData, { status: 201 });

    } catch (error) {
        console.error('API Error creating booking:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

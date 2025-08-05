
import { createClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { getEmailTemplate } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

// GET bookings, optionally filtered by locationId or userEmail or bookingId
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('locationId');
    const userEmail = searchParams.get('userEmail');
    const bookingId = searchParams.get('id');

    try {
        const supabase = createClient();
        let query = supabase.from('bookings').select('*');

        if (locationId) {
            query = query.eq('location_id', locationId);
        }

        if (userEmail) {
            query = query.eq('user_email', userEmail);
        }

        if (bookingId) {
            query = query.eq('id', bookingId);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        // Map snake_case to camelCase
        const responseData = data.map(b => ({
            id: b.id,
            locationId: b.location_id,
            userEmail: b.user_email,
            startTime: b.start_time,
            endTime: b.end_time,
            status: b.status,
            department: b.department,
            occasion: b.occasion,
        }));

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("API Error fetching bookings:", error);
        return NextResponse.json({ message: "Failed to fetch bookings" }, { status: 500 });
    }
}


// POST a new booking
export async function POST(req: NextRequest) {
    try {
        const { locationId, userEmail, startTime, endTime, department, occasion } = await req.json();

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
            status: 'pending', // Default status
            department: department,
            occasion: occasion
        };

        const { data, error } = await supabase
            .from('bookings')
            .insert(newBooking)
            .select()
            .single();

        if (error) throw error;
        
        // "Send" pending email notification
        try {
            const template = await getEmailTemplate('booking_pending');
            // In a real app, you would use a service like SendGrid, Resend, etc.
            // and a real template engine like Handlebars.
            console.log("--- Sending Email ---");
            console.log("To:", userEmail);
            console.log("Subject:", template.subject);
            // Basic placeholder replacement
            const body = template.body
                .replace('{{name}}', userEmail) // No user name available here easily
                .replace('{{locationName}}', `Location ID: ${locationId}`)
                .replace('{{date}}', new Date(startTime).toLocaleDateString())
                .replace('{{startTime}}', new Date(startTime).toLocaleTimeString())
                .replace('{{endTime}}', new Date(endTime).toLocaleTimeString());
            console.log("Body:", body);
            console.log("--- Email Sent ---");
        } catch(emailError) {
            console.error("Failed to 'send' booking pending email:", emailError);
            // Do not fail the request if email fails
        }

        // Map back to camelCase for the client
        const responseData = {
            id: data.id,
            locationId: data.location_id,
            userEmail: data.user_email,
            startTime: data.start_time,
            endTime: data.end_time,
            status: data.status,
            department: data.department,
            occasion: data.occasion
        };

        return NextResponse.json(responseData, { status: 201 });

    } catch (error) {
        console.error('API Error creating booking:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}


import { createClient } from "@/lib/supabase/server-client";
import { getEmailTemplate, getLocations } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// Update a booking (e.g., status)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const body = await req.json();
        const supabase = createClient();

        // Convert camelCase from client to snake_case for DB
        const updateData: { [key: string]: any } = {};
        if (body.status) updateData.status = body.status;
        if (body.startTime) updateData.start_time = body.startTime;
        if (body.endTime) updateData.end_time = body.endTime;
        
        const { data, error } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        
        // If status was changed, send the appropriate email and create notification
        if (body.status && (body.status === 'approved' || body.status === 'rejected')) {
            const allLocations = await getLocations();
            const location = allLocations.find(l => l.id === data.location_id);
            const locationName = location?.name || `Location ID: ${data.location_id}`;
             
             // Send email
             try {
                const templateName = body.status === 'approved' ? 'booking_approved' : 'booking_rejected';
                const template = await getEmailTemplate(templateName);
                
                await sendEmail({
                    to: data.user_email,
                    subject: template.subject,
                    body: template.body,
                    params: {
                        name: data.user_email.split('@')[0], // Simple name extraction
                        locationName: locationName,
                        date: new Date(data.start_time).toLocaleDateString(),
                        startTime: new Date(data.start_time).toLocaleTimeString(),
                        endTime: new Date(data.end_time).toLocaleTimeString(),
                    }
                });
            } catch(emailError) {
                console.error(`Failed to send booking ${body.status} email:`, emailError);
            }

            // Create notification in DB
            try {
                const notificationMessage = `Your booking for ${locationName} has been ${body.status}.`;
                await supabase.from('notifications').insert({
                    id: `notif-${uuidv4()}`,
                    user_email: data.user_email,
                    message: notificationMessage,
                    link: '/my-bookings'
                });
            } catch (notificationError) {
                console.error('Failed to create notification:', notificationError);
            }
        }
        
        return NextResponse.json(data);

    } catch (error) {
        console.error(`API Error updating booking ${id}:`, error);
        return NextResponse.json({ message: `Failed to update booking ${id}` }, { status: 500 });
    }
}

// Delete a booking
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
     const { id } = params;
     try {
        const supabase = createClient();
        
        const { data: booking, error: fetchError } = await supabase.from('bookings').select().eq('id', id).single();
        if(fetchError || !booking) throw fetchError || new Error('Booking not found');

        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        const allLocations = await getLocations();
        const location = allLocations.find(l => l.id === booking.location_id);
        const locationName = location?.name || `Location ID: ${booking.location_id}`;
            
        // Send cancellation email
        try {
            const template = await getEmailTemplate('booking_cancellation');
            
            await sendEmail({
                to: booking.user_email,
                subject: template.subject,
                body: template.body,
                params: {
                    name: booking.user_email.split('@')[0],
                    locationName: locationName,
                    date: new Date(booking.start_time).toLocaleDateString(),
                }
            });
        } catch(emailError) {
            console.error("Failed to send cancellation email:", emailError);
        }

         // Create cancellation notification in DB
        try {
            const notificationMessage = `Your booking for ${locationName} has been cancelled.`;
            await supabase.from('notifications').insert({
                id: `notif-${uuidv4()}`,
                user_email: booking.user_email,
                message: notificationMessage,
                link: '/my-bookings'
            });
        } catch (notificationError) {
            console.error('Failed to create cancellation notification:', notificationError);
        }
        
        return NextResponse.json({ message: `Booking ${id} deleted successfully.` }, { status: 200 });

    } catch (error) {
        console.error(`API Error deleting booking ${id}:`, error);
        return NextResponse.json({ message: `Failed to delete booking ${id}` }, { status: 500 });
    }
}

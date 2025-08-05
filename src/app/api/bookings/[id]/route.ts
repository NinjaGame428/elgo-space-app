
import { createClient } from "@/lib/supabase/server-client";
import { getEmailTemplate, getLocations } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

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
        
        // If status was changed, send the appropriate email
        if (body.status) {
             try {
                const allLocations = await getLocations();
                const location = allLocations.find(l => l.id === data.location_id);
                const templateName = body.status === 'approved' ? 'booking_approved' : 'booking_rejected';
                
                const template = await getEmailTemplate(templateName);
                
                await sendEmail({
                    to: data.user_email,
                    subject: template.subject,
                    body: template.body,
                    params: {
                        name: data.user_email.split('@')[0], // Simple name extraction
                        locationName: location?.name || `Location ID: ${data.location_id}`,
                        date: new Date(data.start_time).toLocaleDateString(),
                        startTime: new Date(data.start_time).toLocaleTimeString(),
                        endTime: new Date(data.end_time).toLocaleTimeString(),
                    }
                });

            } catch(emailError) {
                console.error(`Failed to send booking ${body.status} email:`, emailError);
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

        // Send cancellation email
        try {
            const allLocations = await getLocations();
            const location = allLocations.find(l => l.id === booking.location_id);
            const template = await getEmailTemplate('booking_cancellation');
            
            await sendEmail({
                to: booking.user_email,
                subject: template.subject,
                body: template.body,
                params: {
                    name: booking.user_email.split('@')[0],
                    locationName: location?.name || `Location ID: ${booking.location_id}`,
                    date: new Date(booking.start_time).toLocaleDateString(),
                }
            });
        } catch(emailError) {
            console.error("Failed to send cancellation email:", emailError);
        }
        
        return NextResponse.json({ message: `Booking ${id} deleted successfully.` }, { status: 200 });

    } catch (error) {
        console.error(`API Error deleting booking ${id}:`, error);
        return NextResponse.json({ message: `Failed to delete booking ${id}` }, { status: 500 });
    }
}

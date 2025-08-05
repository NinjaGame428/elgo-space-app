
import { createClient } from "@/lib/supabase/server-client";
import { getEmailTemplate } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
        
        // If status was changed to 'approved' or 'rejected', send email
        if (body.status === 'approved') {
             try {
                const template = await getEmailTemplate('booking_approved');
                console.log("--- Sending Email ---");
                console.log("To:", data.user_email);
                console.log("Subject:", template.subject);
                 const body = template.body
                    .replace('{{name}}', data.user_email)
                    .replace('{{locationName}}', `Location ID: ${data.location_id}`)
                    .replace('{{date}}', new Date(data.start_time).toLocaleDateString())
                    .replace('{{startTime}}', new Date(data.start_time).toLocaleTimeString())
                    .replace('{{endTime}}', new Date(data.end_time).toLocaleTimeString());
                console.log("Body:", body);
                console.log("--- Email Sent ---");
            } catch(emailError) {
                console.error("Failed to 'send' booking approved email:", emailError);
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
        
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        return NextResponse.json({ message: `Booking ${id} deleted successfully.` }, { status: 200 });

    } catch (error) {
        console.error(`API Error deleting booking ${id}:`, error);
        return NextResponse.json({ message: `Failed to delete booking ${id}` }, { status: 500 });
    }
}

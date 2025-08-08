
import { createClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Mark all notifications for a user as read
export async function POST(req: NextRequest) {
    try {
        const { userEmail } = await req.json();

        if (!userEmail) {
            return NextResponse.json({ message: 'userEmail is required' }, { status: 400 });
        }
        
        const supabase = createClient();

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_email', userEmail)
            .eq('is_read', false); // Only update unread notifications

        if (error) throw error;

        return NextResponse.json({ message: 'Notifications marked as read' }, { status: 200 });

    } catch (error: any) {
        console.error('API Error marking notifications as read:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}

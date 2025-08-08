
import { createClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET notifications for a specific user
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
        return NextResponse.json({ message: "userEmail is required" }, { status: 400 });
    }

    try {
        const supabase = createClient();
        let { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false })
            .limit(10); // Get latest 10 notifications

        if (error) throw error;
        
        return NextResponse.json(data);

    } catch (error) {
        console.error("API Error fetching notifications:", error);
        return NextResponse.json({ message: "Failed to fetch notifications" }, { status: 500 });
    }
}

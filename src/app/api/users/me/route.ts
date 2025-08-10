
import { createClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET the profile for the currently authenticated user
export async function GET(req: NextRequest) {
    try {
        const supabase = createClient();

        // Get the current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch the user's profile from the 'users' table
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (profileError) {
            // This could happen if RLS fails or the user profile doesn't exist for some reason
            throw profileError;
        }

        return NextResponse.json(userProfile);

    } catch (error: any) {
        console.error(`API Error fetching current user profile:`, error);
        return NextResponse.json({ message: `Failed to fetch user profile: ${error.message}` }, { status: 500 });
    }
}

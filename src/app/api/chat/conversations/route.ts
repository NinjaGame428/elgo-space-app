
import { createClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET conversations, optionally for a specific user
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const supabase = createClient();

    try {
        let query = supabase
            .from('conversations')
            .select(`
                *,
                user:users!conversations_user_id_fkey ( id, name, email ),
                admin:users!conversations_admin_id_fkey ( id, name, email )
            `)
            .order('updated_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API Error fetching conversations:", error);
        return NextResponse.json({ message: "Failed to fetch conversations", error: error.message }, { status: 500 });
    }
}

// POST a new conversation
export async function POST(req: NextRequest) {
    const { userId } = await req.json();

    if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('conversations')
            .insert({ user_id: userId })
            .select()
            .single();
        
        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error("API Error creating conversation:", error);
        return NextResponse.json({ message: "Failed to create conversation", error: error.message }, { status: 500 });
    }
}

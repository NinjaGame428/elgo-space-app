
import { createClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

// GET messages for a conversation
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
        return NextResponse.json({ message: 'Conversation ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API Error fetching messages:", error);
        return NextResponse.json({ message: "Failed to fetch messages", error: error.message }, { status: 500 });
    }
}


// POST a new message
export async function POST(req: NextRequest) {
    const { conversationId, senderId, content } = await req.json();

    if (!conversationId || !senderId || !content) {
        return NextResponse.json({ message: 'conversationId, senderId, and content are required' }, { status: 400 });
    }

    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content: content,
            })
            .select()
            .single();
        
        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error("API Error posting message:", error);
        return NextResponse.json({ message: "Failed to post message", error: error.message }, { status: 500 });
    }
}

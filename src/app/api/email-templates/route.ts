
import { createClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET all email templates
export async function GET(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .order('id');
        
        if (error) throw error;
        
        return NextResponse.json(data);

    } catch (error) {
        console.error("API Error fetching email templates:", error);
        return NextResponse.json({ message: "Failed to fetch email templates" }, { status: 500 });
    }
}

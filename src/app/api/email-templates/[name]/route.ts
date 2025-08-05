
import { createClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// PATCH to update an email template
export async function PATCH(req: NextRequest, { params }: { params: { name: string } }) {
    const { name } = params;
    try {
        const body = await req.json();
        const { subject, body: templateBody } = body;
        
        if (!subject || !templateBody) {
            return NextResponse.json({ message: 'Subject and body are required' }, { status: 400 });
        }

        const supabase = createClient();

        const { data, error } = await supabase
            .from('email_templates')
            .update({ subject, body: templateBody, updated_at: new Date().toISOString() })
            .eq('name', name)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`API Error updating email template ${name}:`, error);
        return NextResponse.json({ message: `Failed to update email template ${name}` }, { status: 500 });
    }
}

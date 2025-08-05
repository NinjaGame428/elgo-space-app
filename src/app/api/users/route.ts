
import { createClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";
import { getUsers as getAllUsers } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('email');

    try {
        if (userEmail) {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', userEmail);
            
            if (error) throw error;
            return NextResponse.json(data);
        }

        const users = await getAllUsers();
        return NextResponse.json(users);
    } catch (error) {
        console.error("API Error fetching users:", error);
        return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
    }
}

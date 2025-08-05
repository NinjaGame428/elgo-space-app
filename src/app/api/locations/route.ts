
import { getLocations } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const locations = await getLocations();
        return NextResponse.json(locations);
    } catch (error) {
        console.error("API Error fetching locations:", error);
        return NextResponse.json({ message: "Failed to fetch locations" }, { status: 500 });
    }
}

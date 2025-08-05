
import { createClient } from "@/lib/supabase/server-client";
import { getLocations } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

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

export async function POST(req: NextRequest) {
    try {
        const { name, address, imageUrl, amenities } = await req.json();
        
        if (!name || !address) {
            return NextResponse.json({ message: 'Name and address are required' }, { status: 400 });
        }
        
        const supabase = createClient();

        // 1. Insert the new location
        const newLocationId = `location-${uuidv4()}`;
        const { data: locationData, error: locationError } = await supabase
            .from('locations')
            .insert({
                id: newLocationId,
                name,
                address,
                image_url: imageUrl,
            })
            .select('id')
            .single();

        if (locationError) throw locationError;
        
        // 2. Handle amenities
        if (amenities && amenities.length > 0) {
            // Get all existing amenities from DB to find their IDs
            const { data: allDbAmenities, error: amenitiesError } = await supabase
                .from('amenities')
                .select('id, name');
            
            if (amenitiesError) throw amenitiesError;

            const amenityLinks = amenities
                .map((amenity: { name: string }) => {
                    const dbAmenity = allDbAmenities.find(a => a.name === amenity.name);
                    return dbAmenity ? { location_id: locationData.id, amenity_id: dbAmenity.id } : null;
                })
                .filter((link: any): link is { location_id: string; amenity_id: number } => link !== null);

            if (amenityLinks.length > 0) {
                 const { error: locationAmenitiesError } = await supabase
                    .from('location_amenities')
                    .insert(amenityLinks);

                if (locationAmenitiesError) throw locationAmenitiesError;
            }
        }
        
        // 3. Fetch the complete new location to return
        const { data: newLocation, error: newLocationError } = await supabase
            .from('locations')
            .select(`*, amenities(id, name)`)
            .eq('id', locationData.id)
            .single();

        if (newLocationError) throw newLocationError;

        return NextResponse.json(newLocation, { status: 201 });

    } catch (error: any) {
        console.error('API Error creating location:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}

    
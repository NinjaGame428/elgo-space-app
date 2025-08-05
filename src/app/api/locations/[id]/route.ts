
import { createClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET a single location by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('locations')
            .select(`*, amenities ( id, name )`)
            .eq('id', id)
            .single();
        
        if (error) throw error;

        // Map to camelCase
        const location = {
            id: data.id,
            name: data.name,
            address: data.address,
            imageUrl: data.image_url,
            amenities: data.amenities.map((a: any) => ({ id: a.id, name: a.name })),
        };

        return NextResponse.json(location);

    } catch (error: any) {
        console.error(`API Error fetching location ${id}:`, error);
        return NextResponse.json({ message: `Failed to fetch location ${id}: ${error.message}` }, { status: 500 });
    }
}


// PATCH to update a location's details
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const body = await req.json();
        const { address, imageUrl, amenities } = body;
        
        const supabase = createClient();

        // 1. Update basic location info
        const locationUpdate: { [key: string]: any } = {};
        if (address) locationUpdate.address = address;
        if (imageUrl) locationUpdate.image_url = imageUrl;

        if (Object.keys(locationUpdate).length > 0) {
            const { error: locationError } = await supabase
                .from('locations')
                .update(locationUpdate)
                .eq('id', id);

            if (locationError) throw locationError;
        }

        // 2. Update amenities
        if (amenities) {
            // Delete existing amenity links for this location
            const { error: deleteError } = await supabase
                .from('location_amenities')
                .delete()
                .eq('location_id', id);
            
            if (deleteError) throw deleteError;

            // Get all existing amenities from DB to find their IDs
            const { data: allDbAmenities, error: amenitiesError } = await supabase
                .from('amenities')
                .select('id, name');
            
            if (amenitiesError) throw amenitiesError;

            // Create new links
            const amenityLinks = amenities
                .map((amenity: { name: string }) => {
                    const dbAmenity = allDbAmenities.find(a => a.name === amenity.name);
                    return dbAmenity ? { location_id: id, amenity_id: dbAmenity.id } : null;
                })
                .filter((link: any): link is { location_id: string; amenity_id: number } => link !== null);
            
            if (amenityLinks.length > 0) {
                 const { error: locationAmenitiesError } = await supabase
                    .from('location_amenities')
                    .insert(amenityLinks);

                if (locationAmenitiesError) throw locationAmenitiesError;
            }
        }
        
        // 3. Fetch the complete updated location to return
        const { data: updatedLocation, error: fetchError } = await supabase
            .from('locations')
            .select(`*, amenities(id, name)`)
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        return NextResponse.json(updatedLocation);

    } catch (error: any) {
        console.error(`API Error updating location ${id}:`, error);
        return NextResponse.json({ message: error.message || `Failed to update location ${id}` }, { status: 500 });
    }
}

// DELETE a location
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
     const { id } = params;
     try {
        const supabase = createClient();
        
        const { error } = await supabase
            .from('locations')
            .delete()
            .eq('id', id);

        if (error) {
            // Check for foreign key violation (e.g., existing bookings)
            if (error.code === '23503') {
                 return NextResponse.json({ message: 'Cannot delete room with active bookings.' }, { status: 409 });
            }
            throw error;
        }
        
        return NextResponse.json({ message: `Location ${id} deleted successfully.` }, { status: 200 });

    } catch (error: any) {
        console.error(`API Error deleting location ${id}:`, error);
        return NextResponse.json({ message: error.message || `Failed to delete location ${id}` }, { status: 500 });
    }
}

    
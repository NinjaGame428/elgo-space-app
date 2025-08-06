
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET a single user by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    // Use the admin client to bypass RLS for this internal operation
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`API Error fetching user ${id}:`, error);
        return NextResponse.json({ message: `Failed to fetch user ${id}: ${error.message}` }, { status: 500 });
    }
}

// PATCH to update a user's details (e.g., name, email, role)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    // Use the admin client to ensure we have permissions to update any user
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await req.json();
        const { name, email, role } = body;
        
        // Data for the 'users' table
        const profileUpdate: { [key: string]: any } = {};
        if (name) profileUpdate.name = name;
        if (role) profileUpdate.role = role;

        // Update the user's profile in the 'users' table
        if (Object.keys(profileUpdate).length > 0) {
            const { error: profileError } = await supabaseAdmin
                .from('users')
                .update(profileUpdate)
                .eq('id', id);

            if (profileError) throw profileError;
        }

        // If email is being changed, update it in Supabase Auth as well
        if (email) {
            const { data: { user } , error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, { email });
            if (authError) throw authError;
        }

        // Fetch the updated user to return
        const { data: updatedUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        return NextResponse.json(updatedUser);

    } catch (error: any) {
        console.error(`API Error updating user ${id}:`, error);
        return NextResponse.json({ message: error.message || `Failed to update user ${id}` }, { status: 500 });
    }
}

// DELETE a user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
     const { id } = params;
     const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
     );
     try {
        // This will also delete the corresponding user from the 'users' table via a trigger
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) throw error;
        
        return NextResponse.json({ message: `User ${id} deleted successfully.` }, { status: 200 });

    } catch (error: any) {
        console.error(`API Error deleting user ${id}:`, error);
        return NextResponse.json({ message: error.message || `Failed to delete user ${id}` }, { status: 500 });
    }
}

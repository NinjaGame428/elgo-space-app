
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// This is the client-side Supabase client.
// It's used in client components and client-side scripts.
export const createClient = () => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};

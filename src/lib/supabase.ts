
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side environment
// and we don't supply a hook to access the service role key.
// const supabaseAdmin = createSupabaseClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

export const createClient = () => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};

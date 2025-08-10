
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }
  
  // signInWithPassword will set the session cookie on success
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ message: authError?.message || 'Invalid credentials' }, { status: 401 });
  }

  // Use an admin client to fetch the user profile to bypass RLS policies
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Now, fetch the user's profile to get their role
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      // Even if the profile isn't found, the user is logged in.
      // We can default the role to 'User' on the client.
      const user = {
        id: authData.user.id,
        email: authData.user.email,
        role: 'User',
      };
      return NextResponse.json({ message: 'Login successful, but profile not found.', user }, { status: 200 });
  }
    
  const user = {
      id: authData.user.id,
      email: authData.user.email,
      role: profile.role,
  };

  return NextResponse.json({ message: 'Login successful', user }, { status: 200 });
}

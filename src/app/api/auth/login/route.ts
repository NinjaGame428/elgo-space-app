
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
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }
  
  // 1. Authenticate user with password
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error('Login auth error:', authError);
    return NextResponse.json({ message: authError?.message || 'Invalid credentials' }, { status: 401 });
  }

  // 2. Use an admin client to fetch the user's profile, bypassing RLS
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Fetch the user's profile from the public.users table
  let { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role, name')
    .eq('id', authData.user.id)
    .single();

  // 4. If profile doesn't exist, create it. This makes the login flow robust.
  if (profileError && profileError.code === 'PGRST116') { // "PGRST116" is the code for "Not Found"
      console.warn(`User profile not found for ${authData.user.email}, creating one.`);
      const { data: newProfile, error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
              id: authData.user.id,
              email: authData.user.email,
              name: authData.user.user_metadata?.full_name || authData.user.email,
              role: 'User' // Default role
          })
          .select('role, name')
          .single();

      if (insertError) {
          console.error('Error creating user profile during login:', insertError);
          return NextResponse.json({ message: 'Could not create user profile during login.' }, { status: 500 });
      }
      profile = newProfile;
  } else if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ message: 'Could not fetch user profile.' }, { status: 500 });
  }
    
  const user = {
      id: authData.user.id,
      email: authData.user.email,
      name: profile.name,
      role: profile.role,
  };

  return NextResponse.json({ message: 'Login successful', user }, { status: 200 });
}

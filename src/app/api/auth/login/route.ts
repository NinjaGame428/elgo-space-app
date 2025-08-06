
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const supabase = createClient();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }
  
  // signInWithPassword will return a session object on success
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user || !authData.session) {
    return NextResponse.json({ message: authError?.message || 'Invalid credentials' }, { status: 401 });
  }

  // Use an admin client to fetch the user profile to bypass RLS policies
  // This is a common pattern to avoid login issues caused by RLS.
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
      return NextResponse.json({ message: 'Could not find user profile.' }, { status: 404 });
  }
    
  const user = {
      id: authData.user.id,
      email: authData.user.email,
      role: profile.role,
  };

  const response = NextResponse.json({ message: 'Login successful', user }, { status: 200 });

  // Manually set the session cookie for the browser
  await response.cookies.set({
    name: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('.')[0].substring(8)}-auth-token`,
    value: JSON.stringify(authData.session),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: authData.session.expires_in,
  });

  return response;
}

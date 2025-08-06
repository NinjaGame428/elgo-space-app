
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const cookieStore = cookies();
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

  // Manually set the session cookie for the browser
  cookieStore.set(
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('.')[0].split('//')[1]}-auth-token`,
      JSON.stringify({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_in: authData.session.expires_in,
          token_type: 'bearer',
          user: {id: authData.user.id},
      }),
      {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: authData.session.expires_in,
      },
  );


  // Now, fetch the user's profile to get their role
  const { data: profile, error: profileError } = await supabase
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

  return NextResponse.json({ message: 'Login successful', user }, { status: 200 });
}

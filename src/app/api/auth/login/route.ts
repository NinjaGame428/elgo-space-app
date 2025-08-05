
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ message: authError?.message || 'Invalid credentials' }, { status: 401 });
    }

    // Fetch user details like role from your 'users' table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
        // If profile doesn't exist, you might want to create it or handle as an error
        console.error('Profile fetch error:', profileError);
        return NextResponse.json({ message: 'Could not find user profile.' }, { status: 404 });
    }
      
    const user = {
        id: authData.user.id,
        email: authData.user.email,
        role: profile.role,
    };

    return NextResponse.json({ message: 'Login successful', user }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

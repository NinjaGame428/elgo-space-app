
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ message: authError.message || 'Could not sign up user.' }, { status: authError.status || 400 });
    }
    
    if (!authData.user) {
         return NextResponse.json({ message: 'Signup successful, but user data not returned.' }, { status: 500 });
    }

    // The trigger `on_auth_user_created` in the database will automatically create a profile in the `users` table.

    return NextResponse.json({ message: 'Signup successful! Please check your email to confirm your account.' }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

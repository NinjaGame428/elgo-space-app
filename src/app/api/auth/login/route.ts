
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ message: error.message || 'Invalid credentials' }, { status: 401 });
    }

    // You would typically fetch user details (like role) from your own 'users' or 'profiles' table
    // For this example, we'll keep it simple.
    // Let's assume you have a public 'profiles' table with a 'role' column.
    // const { data: profile, error: profileError } = await supabase
    //   .from('profiles')
    //   .select('role')
    //   .eq('id', data.user.id)
    //   .single();
      
    // A simplified user object. In a real app, you would not hardcode the role.
    const user = {
        email: data.user.email,
        role: data.user.email === 'test@example.com' ? 'Admin' : 'User'
    };


    return NextResponse.json({ message: 'Login successful', user }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

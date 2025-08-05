
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Sign up the user
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

    // In a real application, you might also want to insert a corresponding row into a `profiles` table
    // with the user's role and other details.
    // For example:
    // const { error: profileError } = await supabase.from('profiles').insert({
    //   id: authData.user.id,
    //   email: email,
    //   name: name,
    //   role: 'User' // Default role
    // });
    // if (profileError) {
    //    console.error('Error creating user profile:', profileError);
    //    // You might want to handle this case, e.g., by deleting the auth user if the profile creation fails.
    // }

    // Supabase handles sending a confirmation email automatically if you enable it in your project settings.
    
    return NextResponse.json({ message: 'Signup successful! Please check your email to confirm your account.' }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

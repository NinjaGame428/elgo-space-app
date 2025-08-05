
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ message: 'Name, email, password, and phone are required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone, // Pass phone to metadata
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
    // We now need to update that profile with the phone number.
    const { error: updateError } = await supabase
      .from('users')
      .update({ phone: phone })
      .eq('id', authData.user.id);

    if (updateError) {
        // Log the error, but don't fail the request as the user is already created
        console.error('Error updating user phone number:', updateError);
    }

    return NextResponse.json({ message: 'Signup successful! Please check your email to confirm your account.' }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

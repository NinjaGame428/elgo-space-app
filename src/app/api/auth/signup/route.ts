
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { sendEmail } from '@/lib/email';

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
    // We now need to update that profile with the phone number and full name.
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        phone: phone,
        name: name
      })
      .eq('id', authData.user.id);

    if (updateError) {
        // Log the error, but don't fail the request as the user is already created
        console.error('Error updating user profile:', updateError);
    }
    
    // Send notification email to admin
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'heavenkeys2022@gmail.com';
        await sendEmail({
            to: adminEmail,
            subject: 'New User Registration on Elgo Space',
            body: `
                <p>A new user has registered on the Elgo Space platform.</p>
                <ul>
                    <li><strong>Name:</strong> {{name}}</li>
                    <li><strong>Email:</strong> {{email}}</li>
                    <li><strong>Phone:</strong> {{phone}}</li>
                </ul>
            `,
            params: { name, email, phone },
        });
    } catch (emailError) {
        console.error("Failed to send new user notification email to admin:", emailError);
        // Do not fail the request if the admin email fails
    }

    // Return the created user's data (without sensitive info)
    const userResponse = {
        id: authData.user.id,
        email: authData.user.email,
        name: name,
        phone: phone
    };

    return NextResponse.json({ message: 'Account created successfully! You can now log in.', user: userResponse }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

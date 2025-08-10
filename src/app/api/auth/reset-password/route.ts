
import { createClient } from '@/lib/supabase/server-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  const supabase = createClient();
  
  // Get the base URL from the request headers
  const { protocol, host } = new URL(req.url);
  const redirectTo = `${protocol}//${host}/api/auth/callback`; // Supabase redirects here after the user clicks the link

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo,
  });

  if (error) {
    // Note: We don't want to reveal if an email address is registered or not,
    // so we don't return the error message to the client.
    // We log it for debugging purposes.
    console.error('Password reset error:', error.message);
  }

  // Always return a success response to prevent email enumeration.
  return NextResponse.json({ message: 'If an account exists for this email, a password reset link has been sent.' }, { status: 200 });
}

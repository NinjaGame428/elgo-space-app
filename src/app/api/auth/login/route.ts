
import { NextRequest, NextResponse } from 'next/server';
import { users as initialUsers } from '@/lib/data'; // Using mock data for now
// In a real app, you would import your database connection and User model.
// e.g., import { db } from '@/lib/db';
// import { users } from '@/lib/db/schema';
// import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    
    // --- DATABASE LOGIC STARTS HERE ---
    // This is where you would query your database.
    // I'm using the mock data as a placeholder.
    
    // 1. Find the user by email in your database
    // Example with Drizzle ORM:
    // const user = await db.select().from(users).where(eq(users.email, email)).get();
    const users = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('users') || '[]') : initialUsers;
    const user = users.find((u: any) => u.email === email);


    // 2. If user doesn't exist, return an error
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Compare the provided password with the stored hashed password
    // In a real app, you would have a hashed password in your DB.
    // For this demo, we'll just check against the plain text 'password'.
    // With bcrypt, it would look like this:
    // const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    const isPasswordValid = password === 'password'; // MOCK CHECK

    if (!isPasswordValid) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // --- DATABASE LOGIC ENDS HERE ---

    // Don't send the password back to the client
    const { ...userWithoutPassword } = user;

    return NextResponse.json({ message: 'Login successful', user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

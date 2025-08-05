
import { NextRequest, NextResponse } from 'next/server';
import { users as initialUsers } from '@/lib/data'; // Using mock data for now
import { format } from 'date-fns';
// In a real app, you would import your database connection.
// e.g., import { db } from '@/lib/db';
// import { users } from '@/lib/db/schema';
// import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    // --- DATABASE LOGIC STARTS HERE ---
    // This is where you would interact with your database.
    // I'm using mock data manipulation as a placeholder.

    // 1. Check if a user with that email already exists
    // Example with Drizzle ORM:
    // const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    const currentUsers = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('users') || '[]') : initialUsers;
    const existingUser = currentUsers.find((u: any) => u.email === email);

    if (existingUser) {
        return NextResponse.json({ message: 'A user with this email already exists' }, { status: 409 });
    }

    // 2. Hash the password for security
    // const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert the new user into your database
    const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        // password: hashedPassword, // Store the hashed password
        role: 'User',
        joined: format(new Date(), 'yyyy-MM-dd')
    };
    
    // Example with Drizzle ORM:
    // await db.insert(users).values(newUser);
    
    // For now, we just log it. In a real scenario, you'd save it.
    console.log("New user to be added to DB:", newUser);


    // --- DATABASE LOGIC ENDS HERE ---

    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

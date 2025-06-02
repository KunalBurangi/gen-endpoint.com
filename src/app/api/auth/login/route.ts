
import { type NextRequest, NextResponse } from 'next/server';

// Mock user data (in a real app, this would come from a database)
const mockUsers = [
  {id: "usr_1", name: "Alice Wonderland", email: "alice@example.com", password: "securepassword123", role: "admin"},
  {id: "usr_2", name: "Bob The Builder", email: "bob@example.com", password: "anothersecurepassword", role: "editor"},
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Mock authentication: find user by email
    const user = mockUsers.find(u => u.email === email);

    if (!user || user.password !== password) { // In a real app, compare hashed passwords
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;

    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // Token expires in 1 hour

    return NextResponse.json({
      message: "Login successful.",
      user: userWithoutPassword,
      token: `mock_jwt_token_for_${user.id}_${Date.now()}`, // Generate a mock token
      expiresAt: tokenExpiry.toISOString()
    });

  } catch (error) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

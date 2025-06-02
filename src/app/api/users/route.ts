
import { type NextRequest, NextResponse } from 'next/server';

// Mock data store
let users = [
  {id: "usr_1", name: "Alice Wonderland", email: "alice@example.com", role: "admin", createdAt: "2024-01-10T10:00:00Z", profile: {"bio": "Curiouser and curiouser!", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_2", name: "Bob The Builder", email: "bob@example.com", role: "editor", createdAt: "2024-01-11T11:00:00Z", profile: {"bio": "Can we fix it?", "avatarUrl": "https://placehold.co/100x100.png"}},
];

// GET /api/users - Retrieve a list of all users
export async function GET() {
  return NextResponse.json(users);
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newUser = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      name: body.name,
      email: body.email,
      role: body.role || 'viewer',
      createdAt: new Date().toISOString(),
      profile: body.profile || {}
    };
    // In a real app, you'd validate the password and not store/return it.
    // For this mock, we'll just add the user.
    users.push(newUser);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body or error creating user." }, { status: 400 });
  }
}

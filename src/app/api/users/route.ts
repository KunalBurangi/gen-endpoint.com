
import { type NextRequest, NextResponse } from 'next/server';

// Mock data store
let users = [
  {id: "usr_1", name: "Alice Wonderland", email: "alice@example.com", role: "admin", createdAt: "2024-01-10T10:00:00Z", profile: {"bio": "Curiouser and curiouser!", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_2", name: "Bob The Builder", email: "bob@example.com", role: "editor", createdAt: "2024-01-11T11:00:00Z", profile: {"bio": "Can we fix it?", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_3", name: "Charlie Chaplin", email: "charlie@example.com", role: "viewer", createdAt: "2024-01-12T12:00:00Z", profile: {"bio": "A day without laughter is a day wasted.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_4", name: "Diana Prince", email: "diana@example.com", role: "admin", createdAt: "2024-01-13T13:00:00Z", profile: {"bio": "Wonder Woman", "avatarUrl": "https://placehold.co/100x100.png"}}
];

// GET /api/users - Retrieve a list of all users
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get('limit');
  let limitedUsers = [...users]; // Start with a copy of all users

  if (limitParam) {
    const limit = parseInt(limitParam, 10);
    // Ensure limit is a positive number
    if (!isNaN(limit) && limit > 0) {
      limitedUsers = limitedUsers.slice(0, limit);
    }
    // If limit is invalid (e.g., not a number, zero, or negative), we can choose to return all or an error.
    // For this mock, returning all if limit is invalid or not provided seems fine.
  }

  return NextResponse.json(limitedUsers);
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



import { type NextRequest, NextResponse } from 'next/server';

// Mock data store (should ideally be shared with /api/users/route.ts or use a proper DB)
// For simplicity, we'll redefine it here. In a real app, use a service or database.
let users = [
  {id: "usr_1", name: "Alice Wonderland", email: "alice@example.com", role: "admin", createdAt: "2024-01-10T10:00:00Z", profile: {"bio": "Curiouser and curiouser!", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_2", name: "Bob The Builder", email: "bob@example.com", role: "editor", createdAt: "2024-01-11T11:00:00Z", profile: {"bio": "Can we fix it?", "avatarUrl": "https://placehold.co/100x100.png"}},
];


interface Params {
  userId: string;
}

// GET /api/users/{userId} - Retrieve a specific user
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { userId } = params;
  const user = users.find(u => u.id === userId);
  if (user) {
    return NextResponse.json(user);
  }
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}

// PUT /api/users/{userId} - Update an existing user
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const { userId } = params;
  try {
    const body = await request.json();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = { ...users[userIndex], ...body, updatedAt: new Date().toISOString() };
    users[userIndex] = updatedUser;
    
    // Remove potentially sensitive fields like password if they were part of the body
    // For this mock, we assume body is safe.
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body or error updating user." }, { status: 400 });
  }
}

// DELETE /api/users/{userId} - Delete a user
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { userId } = params;
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  users.splice(userIndex, 1); // Remove the user
  return NextResponse.json({ message: `User ${userId} deleted successfully.`, timestamp: new Date().toISOString() });
}


import { type NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser, User } from '../../../../lib/data/users';

interface Params {
  userId: string;
}

// GET /api/users/{userId} - Retrieve a specific user
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { userId } = params;
  const user = getUserById(userId);
  if (user) {
    return NextResponse.json(user);
  }
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}

// PUT /api/users/{userId} - Update an existing user
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const { userId } = params;
  try {
    const body = await request.json() as Partial<Omit<User, 'id' | 'createdAt'>>;

    // Ensure that crucial fields like 'id' or 'createdAt' are not passed in body to be updated directly
    // The updateUser function in lib/data/users.ts should handle this,
    // but as a good practice, we can also ensure the body doesn't contain them.
    const { id, createdAt, ...updateData } = body as any; // Exclude id and createdAt from body if present

    const updatedUser = updateUser(userId, updateData);

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body or error updating user." }, { status: 400 });
  }
}

// DELETE /api/users/{userId} - Delete a user
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { userId } = params;
  const success = deleteUser(userId);

  if (!success) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ message: `User ${userId} deleted successfully.`, timestamp: new Date().toISOString() });
}

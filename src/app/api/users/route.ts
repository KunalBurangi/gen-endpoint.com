
import { type NextRequest, NextResponse } from 'next/server';
import { getAllUsers, addUser, User } from '../../../lib/data/users';

// GET /api/users - Retrieve a list of all users
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get('limit');
  let usersToReturn = getAllUsers();

  if (limitParam) {
    const limit = parseInt(limitParam, 10);
    // Ensure limit is a positive number
    if (!isNaN(limit) && limit > 0) {
      usersToReturn = usersToReturn.slice(0, limit);
    }
  }

  return NextResponse.json(usersToReturn);
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
    // Basic validation
    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    const newUser = addUser(body);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body or error creating user." }, { status: 400 });
  }
}


import { type NextRequest, NextResponse } from 'next/server';

// Mock chat room storage
let chatRooms = [
  {
    id: "room_1",
    name: "General Discussion",
    description: "Main chat room for all users",
    participants: 45,
    lastActivity: "2024-08-16T12:00:00Z",
    type: "public",
    createdAt: "2024-08-10T10:00:00Z",
    createdBy: "system"
  },
  {
    id: "room_2",
    name: "Tech Support",
    description: "Get help with technical issues",
    participants: 12,
    lastActivity: "2024-08-16T11:30:00Z",
    type: "public",
    createdAt: "2024-08-11T14:00:00Z",
    createdBy: "system"
  }
];
let roomCounter = chatRooms.length + 1;

// GET /api/chat/rooms - List available chat rooms
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);

  let filteredRooms = [...chatRooms];

  if (type) {
    filteredRooms = filteredRooms.filter(room => room.type === type);
  }

  // Sort by last activity (newest first)
  filteredRooms.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

  return NextResponse.json({
    rooms: paginatedRooms,
    pagination: {
      page,
      limit,
      total: filteredRooms.length,
      pages: Math.ceil(filteredRooms.length / limit)
    }
  });
}

// POST /api/chat/rooms - Create new chat room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type = 'public', maxParticipants = 100 } = body;

    if (!name) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    const newRoom = {
      id: `room_${roomCounter++}`,
      name,
      description: description || `Chat room for ${name}`,
      participants: 0,
      lastActivity: new Date().toISOString(),
      type,
      maxParticipants,
      createdAt: new Date().toISOString(),
      createdBy: "usr_mock" // In a real app, get authenticated user ID
    };

    chatRooms.push(newRoom);

    return NextResponse.json({
      id: newRoom.id,
      name: newRoom.name,
      description: newRoom.description,
      type: newRoom.type,
      createdAt: newRoom.createdAt,
      createdBy: newRoom.createdBy
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body or error creating room' }, { status: 400 });
  }
}

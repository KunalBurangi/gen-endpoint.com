
import { type NextRequest, NextResponse } from 'next/server';

interface Params {
  roomId: string;
}

// Mock message storage for each room
let roomMessages: { [roomId: string]: any[] } = {
  "room_1": [
    {
      id: "msg_123",
      content: "Hello everyone!",
      author: { id: "usr_1", name: "Alice", avatar: "https://placehold.co/40x40.png" },
      timestamp: "2024-08-16T11:58:00Z",
      type: "text"
    },
    {
      id: "msg_124",
      content: "Hi Alice!",
      author: { id: "usr_2", name: "Bob", avatar: "https://placehold.co/40x40.png" },
      timestamp: "2024-08-16T11:59:00Z",
      type: "text"
    }
  ],
  "room_2": [
     {
      id: "msg_201",
      content: "I need help with my account.",
      author: { id: "usr_3", name: "Charlie", avatar: "https://placehold.co/40x40.png" },
      timestamp: "2024-08-16T11:30:00Z",
      type: "text"
    }
  ]
};
let messageCounter = 500;

// GET /api/chat/rooms/{roomId}/messages - Get message history
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { roomId } = params;
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);
  // const before = searchParams.get('before'); // Timestamp for fetching older messages

  const messages = roomMessages[roomId] || [];

  // Sort by timestamp (newest first for typical chat display, or oldest first for history)
  // For this mock, let's assume newest first is desired for an initial load.
  const sortedMessages = [...messages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMessages = sortedMessages.slice(startIndex, endIndex);

  return NextResponse.json({
    messages: paginatedMessages,
    pagination: {
      page,
      limit,
      total: sortedMessages.length,
      pages: Math.ceil(sortedMessages.length / limit),
      hasMore: endIndex < sortedMessages.length
    }
  });
}

// POST /api/chat/rooms/{roomId}/messages - Send message to chat room
export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { roomId } = params;

  try {
    const body = await request.json();
    const { content, type = 'text', replyTo = null } = body;

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    if (!roomMessages[roomId]) {
      // Optionally create the room's message array if it doesn't exist
      roomMessages[roomId] = [];
    }

    const newMessage = {
      id: `msg_${messageCounter++}`,
      content,
      author: { id: "usr_mock", name: "Mock User", avatar: "https://placehold.co/40x40.png" }, // Get from auth in real app
      timestamp: new Date().toISOString(),
      type,
      replyTo,
      roomId
    };

    roomMessages[roomId].push(newMessage);
    
    // Update room's last activity (if chatRooms list is accessible or managed elsewhere)
    // For simplicity, this is not done here as chatRooms is in another file.

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body or error sending message' }, { status: 400 });
  }
}


import { type NextRequest, NextResponse } from 'next/server';

// Mock data store
let users = [
  {id: "usr_1", name: "Alice Wonderland", email: "alice@example.com", role: "admin", createdAt: "2024-01-10T10:00:00Z", profile: {"bio": "Curiouser and curiouser!", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_2", name: "Bob The Builder", email: "bob@example.com", role: "editor", createdAt: "2024-01-11T11:00:00Z", profile: {"bio": "Can we fix it?", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_3", name: "Charlie Chaplin", email: "charlie@example.com", role: "viewer", createdAt: "2024-01-12T12:00:00Z", profile: {"bio": "A day without laughter is a day wasted.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_4", name: "Diana Prince", email: "diana@example.com", role: "admin", createdAt: "2024-01-13T13:00:00Z", profile: {"bio": "Wonder Woman", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_5", name: "Edward Scissorhands", email: "edward@example.com", role: "viewer", createdAt: "2024-01-14T14:00:00Z", profile: {"bio": "I am not complete.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_6", name: "Fiona Gallagher", email: "fiona@example.com", role: "editor", createdAt: "2024-01-15T15:00:00Z", profile: {"bio": "Hard worker.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_7", name: "George Costanza", email: "george@example.com", role: "viewer", createdAt: "2024-01-16T16:00:00Z", profile: {"bio": "It's not a lie if you believe it.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_8", name: "Helen Troy", email: "helen@example.com", role: "admin", createdAt: "2024-01-17T17:00:00Z", profile: {"bio": "Launched a thousand ships.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_9", name: "Isaac Newton", email: "isaac@example.com", role: "viewer", createdAt: "2024-01-18T10:00:00Z", profile: {"bio": "Standing on the shoulders of giants.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_10", name: "Jane Austen", email: "jane@example.com", role: "editor", createdAt: "2024-01-19T11:00:00Z", profile: {"bio": "Obstinate, headstrong girl!", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_11", name: "King Arthur", email: "arthur@example.com", role: "admin", createdAt: "2024-01-20T12:00:00Z", profile: {"bio": "King of the Britons.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_12", name: "Leonardo Da Vinci", email: "leo@example.com", role: "editor", createdAt: "2024-01-21T13:00:00Z", profile: {"bio": "Simplicity is the ultimate sophistication.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_13", name: "Marie Curie", email: "marie@example.com", role: "admin", createdAt: "2024-01-22T14:00:00Z", profile: {"bio": "Nothing in life is to be feared.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_14", name: "Nikola Tesla", email: "nikola@example.com", role: "viewer", createdAt: "2024-01-23T15:00:00Z", profile: {"bio": "The present is theirs; the future... is mine.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_15", name: "Oprah Winfrey", email: "oprah@example.com", role: "editor", createdAt: "2024-01-24T16:00:00Z", profile: {"bio": "Turn your wounds into wisdom.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_16", name: "Peter Pan", email: "peter@example.com", role: "viewer", createdAt: "2024-01-25T17:00:00Z", profile: {"bio": "Never grow up.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_17", name: "Queen Elizabeth", email: "liz@example.com", role: "admin", createdAt: "2024-01-26T10:00:00Z", profile: {"bio": "Grief is the price we pay for love.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_18", name: "Robin Hood", email: "robin@example.com", role: "editor", createdAt: "2024-01-27T11:00:00Z", profile: {"bio": "Steal from the rich, give to the poor.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_19", name: "Sherlock Holmes", email: "sherlock@example.com", role: "viewer", createdAt: "2024-01-28T12:00:00Z", profile: {"bio": "Elementary, my dear Watson.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_20", name: "Tony Stark", email: "tony@example.com", role: "admin", createdAt: "2024-01-29T13:00:00Z", profile: {"bio": "I am Iron Man.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_21", name: "Ursula Le Guin", email: "ursula@example.com", role: "editor", createdAt: "2024-01-30T14:00:00Z", profile: {"bio": "The only thing that makes life possible is permanent, intolerable uncertainty.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_22", name: "Vincent Van Gogh", email: "vincent@example.com", role: "viewer", createdAt: "2024-01-31T15:00:00Z", profile: {"bio": "I dream my painting, and then I paint my dream.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_23", name: "William Shakespeare", email: "william@example.com", role: "editor", createdAt: "2024-02-01T16:00:00Z", profile: {"bio": "To be, or not to be.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_24", name: "Xena Warrior Princess", email: "xena@example.com", role: "admin", createdAt: "2024-02-02T17:00:00Z", profile: {"bio": "Ayiyiyiyi!", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_25", name: "Yoda", email: "yoda@example.com", role: "admin", createdAt: "2024-02-03T10:00:00Z", profile: {"bio": "Do or do not. There is no try.", "avatarUrl": "https://placehold.co/100x100.png"}}
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
    users.push(newUser);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body or error creating user." }, { status: 400 });
  }
}

    
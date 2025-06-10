export interface UserProfile {
  bio?: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
  updatedAt?: string;
  profile?: UserProfile;
}

// Initialize an in-memory array with mock data
let users: User[] = [
  {id: "usr_1", name: "Alice Wonderland", email: "alice@example.com", role: "admin", createdAt: "2024-01-10T10:00:00Z", profile: {"bio": "Curiouser and curiouser!", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_2", name: "Bob The Builder", email: "bob@example.com", role: "editor", createdAt: "2024-01-11T11:00:00Z", profile: {"bio": "Can we fix it?", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_3", name: "Charlie Chaplin", email: "charlie@example.com", role: "viewer", createdAt: "2024-01-12T12:00:00Z", profile: {"bio": "A day without laughter is a day wasted.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_4", name: "Diana Prince", email: "diana@example.com", role: "admin", createdAt: "2024-01-13T13:00:00Z", profile: {"bio": "Wonder Woman", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_5", name: "Edward Scissorhands", email: "edward@example.com", role: "viewer", createdAt: "2024-01-14T14:00:00Z", profile: {"bio": "I am not complete.", "avatarUrl": "https://placehold.co/100x100.png"}},
  // Add a few more to ensure comprehensive testing, up to 25 if desired
  {id: "usr_6", name: "Fiona Gallagher", email: "fiona@example.com", role: "editor", createdAt: "2024-01-15T15:00:00Z", profile: {"bio": "Hard worker.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_7", name: "George Costanza", email: "george@example.com", role: "viewer", createdAt: "2024-01-16T16:00:00Z", profile: {"bio": "It's not a lie if you believe it.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_8", name: "Helen Troy", email: "helen@example.com", role: "admin", createdAt: "2024-01-17T17:00:00Z", profile: {"bio": "Launched a thousand ships.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_9", name: "Isaac Newton", email: "isaac@example.com", role: "viewer", createdAt: "2024-01-18T10:00:00Z", profile: {"bio": "Standing on the shoulders of giants.", "avatarUrl": "https://placehold.co/100x100.png"}},
  {id: "usr_10", name: "Jane Austen", email: "jane@example.com", role: "editor", createdAt: "2024-01-19T11:00:00Z", profile: {"bio": "Obstinate, headstrong girl!", "avatarUrl": "https://placehold.co/100x100.png"}},
];

// Function to generate a unique ID
function generateUserId(): string {
  return `usr_${Math.random().toString(36).substring(2, 9)}`;
}

// Exported functions

export function getAllUsers(): User[] {
  return [...users]; // Return a copy to prevent direct modification
}

export function getUserById(id: string): User | undefined {
  return users.find(user => user.id === id);
}

export function addUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  const newUser: User = {
    ...userData,
    id: generateUserId(),
    createdAt: new Date().toISOString(),
    role: userData.role || 'viewer', // Default role if not provided
    profile: userData.profile || {}
  };
  users.push(newUser);
  return newUser;
}

export function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | undefined {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return undefined;
  }
  const updatedUser = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  users[userIndex] = updatedUser;
  return updatedUser;
}

export function deleteUser(id: string): boolean {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return false;
  }
  users.splice(userIndex, 1);
  return true;
}

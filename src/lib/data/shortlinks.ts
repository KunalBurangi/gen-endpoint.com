import { nanoid } from 'nanoid';

export interface ShortLink {
  id: string; // Unique ID for the link entry
  shortCode: string; // The short identifier (e.g., my-link)
  originalUrl: string; // The URL to redirect to
  description?: string;
  userId?: string; // Optional, if linking to users
  createdAt: string;
  expiresAt?: string;
  clickCount: number;
}

// Using a Map for efficient lookups by shortCode and id
const shortLinksByCode: Map<string, ShortLink> = new Map();
const shortLinksById: Map<string, ShortLink> = new Map();

// Helper to validate URL (basic)
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const createShortLink = async (data: {
  originalUrl: string;
  shortCode?: string;
  description?: string;
  expiresAt?: string;
  userId?: string;
}): Promise<ShortLink> => {
  if (!isValidUrl(data.originalUrl)) {
    throw new Error('Invalid original URL');
  }

  let code = data.shortCode || nanoid(7); // Generate 7-char code if not provided
  if (data.shortCode) { // Custom alias requested
    if (shortLinksByCode.has(data.shortCode)) {
      // For simplicity, throw error. Could also append random chars or suggest alternatives.
      throw new Error('Custom alias (shortCode) already exists.');
    }
  } else { // Auto-generate code, ensure uniqueness
    while (shortLinksByCode.has(code)) {
      code = nanoid(7);
    }
  }

  const newLink: ShortLink = {
    id: `link_${nanoid(10)}`, // Unique internal ID
    shortCode: code,
    originalUrl: data.originalUrl,
    description: data.description,
    userId: data.userId,
    createdAt: new Date().toISOString(),
    expiresAt: data.expiresAt,
    clickCount: 0,
  };

  shortLinksByCode.set(newLink.shortCode, newLink);
  shortLinksById.set(newLink.id, newLink);
  return newLink;
};

export const getShortLinkByCode = async (shortCode: string): Promise<ShortLink | undefined> => {
  return shortLinksByCode.get(shortCode);
};

export const getShortLinkById = async (id: string): Promise<ShortLink | undefined> => {
  return shortLinksById.get(id);
};

export const incrementClickCount = async (shortCode: string): Promise<void> => {
  const link = shortLinksByCode.get(shortCode);
  if (link) {
    link.clickCount += 1;
    // If also storing by ID, update that entry too or ensure they reference the same object
    // Since Maps store references to objects, updating 'link' will reflect in both Maps if it's the same object.
    // However, if a copy was made (which is not the case here for Map.get), then explicit update is needed.
    // For clarity or if copies were involved: shortLinksById.set(link.id, link);
  }
};

export const getLinkStats = async (
  shortCode: string
): Promise<{ shortCode: string; originalUrl: string; totalClicks: number; createdAt: string; description?: string; expiresAt?: string; } | null> => {
  const link = shortLinksByCode.get(shortCode);
  if (!link) {
    return null;
  }
  return {
    shortCode: link.shortCode,
    originalUrl: link.originalUrl,
    totalClicks: link.clickCount,
    createdAt: link.createdAt,
    description: link.description,
    expiresAt: link.expiresAt,
  };
};

export const listUserLinks = async (userId?: string, filters?: any): Promise<ShortLink[]> => {
  // Basic filtering by userId if provided. More complex filters can be added.
  const allLinks = Array.from(shortLinksById.values());
  if (userId) {
    return allLinks.filter(link => link.userId === userId);
  }
  // Add other filters here based on `filters` object if needed.
  // Example: Sort by createdAt descending
  allLinks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return allLinks;
};

export const deleteLink = async (id: string, userId?: string): Promise<boolean> => {
  const link = shortLinksById.get(id);
  if (!link) {
    return false; // Not found
  }

  // Optional: Check if userId matches if implementing ownership
  if (userId && link.userId !== userId) {
    // throw new Error('Unauthorized to delete this link'); // Or just return false
    return false;
  }

  shortLinksById.delete(id);
  shortLinksByCode.delete(link.shortCode);
  return true;
};

// Utility for testing/resetting if needed
export const _resetShortLinks = () => {
  shortLinksByCode.clear();
  shortLinksById.clear();
};

// Install nanoid if not already: npm install nanoid
// Ensure your tsconfig.json has "esModuleInterop": true if using commonjs style import for nanoid,
// or use `import { nanoid } from 'nanoid';` for ES module style.
// The provided code uses ES module style.

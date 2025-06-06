// Shared file storage for upload and file management APIs

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
  downloadUrl: string;
  description?: string;
  tags?: string[];
  updatedAt?: string;
}

// Mock file storage - in a real app, this would be a database
export let uploadedFiles: UploadedFile[] = [
  {
    id: "file_123",
    originalName: "sample-document.pdf",
    filename: "file_123_sample-document.pdf",
    size: 1024000,
    mimeType: "application/pdf",
    uploadedAt: "2024-08-16T10:00:00Z",
    url: "/api/files/file_123",
    downloadUrl: "/api/files/file_123/download",
    description: "Sample PDF document for testing",
    tags: ["document", "sample"]
  },
  {
    id: "file_456",
    originalName: "profile-photo.jpg",
    filename: "file_456_profile-photo.jpg",
    size: 2048000,
    mimeType: "image/jpeg",
    uploadedAt: "2024-08-16T09:30:00Z",
    url: "/api/files/file_456",
    downloadUrl: "/api/files/file_456/download",
    description: "Profile photo image",
    tags: ["image", "profile"]
  },
  {
    id: "file_789",
    originalName: "data-export.csv",
    filename: "file_789_data-export.csv",
    size: 512000,
    mimeType: "text/csv",
    uploadedAt: "2024-08-16T08:15:00Z",
    url: "/api/files/file_789",
    downloadUrl: "/api/files/file_789/download",
    description: "CSV data export file",
    tags: ["data", "export", "csv"]
  },
  {
    id: "file_abc",
    originalName: "presentation.pptx",
    filename: "file_abc_presentation.pptx",
    size: 5120000,
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    uploadedAt: "2024-08-15T14:20:00Z",
    url: "/api/files/file_abc",
    downloadUrl: "/api/files/file_abc/download",
    description: "Business presentation slides",
    tags: ["presentation", "business"]
  },
  {
    id: "file_def",
    originalName: "logo.png",
    filename: "file_def_logo.png",
    size: 156000,
    mimeType: "image/png",
    uploadedAt: "2024-08-15T11:45:00Z",
    url: "/api/files/file_def",
    downloadUrl: "/api/files/file_def/download",
    description: "Company logo in PNG format",
    tags: ["logo", "branding", "image"]
  }
];

// Helper functions
export function addFile(file: UploadedFile): void {
  uploadedFiles.push(file);
}

export function removeFile(fileId: string): boolean {
  const index = uploadedFiles.findIndex(f => f.id === fileId);
  if (index >= 0) {
    uploadedFiles.splice(index, 1);
    return true;
  }
  return false;
}

export function findFile(fileId: string): UploadedFile | undefined {
  return uploadedFiles.find(f => f.id === fileId);
}

export function updateFile(fileId: string, updates: Partial<UploadedFile>): UploadedFile | null {
  const index = uploadedFiles.findIndex(f => f.id === fileId);
  if (index >= 0) {
    uploadedFiles[index] = { ...uploadedFiles[index], ...updates, updatedAt: new Date().toISOString() };
    return uploadedFiles[index];
  }
  return null;
}

export function getAllFiles(): UploadedFile[] {
  return [...uploadedFiles];
}

export function generateFileId(): string {
  return `file_${Math.random().toString(36).substring(2, 9)}`;
}

// File validation
export interface FileValidation {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidation {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'text/plain', 'text/csv', 'application/json',
    'application/zip', 'application/x-zip-compressed',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type '${file.type}' not supported. Allowed types: ${allowedTypes.join(', ')}` };
  }

  // Check for malicious filenames
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { valid: false, error: 'Invalid filename characters detected' };
  }

  return { valid: true };
}
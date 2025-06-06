import { type NextRequest, NextResponse } from 'next/server';
import { findFile, removeFile, updateFile, type UploadedFile } from '@/lib/data/files';

interface Params {
  fileId: string;
}

// GET /api/files/{fileId} - Get file metadata
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { fileId } = params;
  
  try {
    const file = findFile(fileId);
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve file information' },
      { status: 500 }
    );
  }
}

// DELETE /api/files/{fileId} - Delete file
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { fileId } = params;
  
  try {
    const success = removeFile(fileId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: `File ${fileId} deleted successfully.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

// PUT /api/files/{fileId} - Update file metadata
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const { fileId } = params;
  
  try {
    const body = await request.json();
    
    const existingFile = findFile(fileId);
    if (!existingFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Only allow updating certain metadata fields
    const allowedFields = ['description', 'tags'];
    const updates: Partial<UploadedFile> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'tags' && Array.isArray(body[field])) {
          updates[field] = body[field].filter((tag: string) => typeof tag === 'string' && tag.trim().length > 0);
        } else if (field === 'description' && typeof body[field] === 'string') {
          updates[field] = body[field].trim();
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update. Allowed fields: description, tags' },
        { status: 400 }
      );
    }

    // Update file metadata
    const updatedFile = updateFile(fileId, updates);
    
    if (!updatedFile) {
      return NextResponse.json(
        { error: 'Failed to update file' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedFile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body or update failed' },
      { status: 400 }
    );
  }
}

// PATCH /api/files/{fileId} - Partial update (alias for PUT)
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  return PUT(request, { params });
}
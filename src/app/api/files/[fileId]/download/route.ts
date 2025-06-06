import { type NextRequest, NextResponse } from 'next/server';
import { findFile } from '@/lib/data/files';

interface Params {
  fileId: string;
}

// GET /api/files/{fileId}/download - Download file
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

    // In a real implementation, you would:
    // 1. Read the actual file from storage (S3, local filesystem, etc.)
    // 2. Stream the file content
    // 3. Set appropriate headers
    
    // For this mock implementation, we'll return a download URL or file info
    // since we don't have actual file storage
    
    const mockFileContent = generateMockFileContent(file.mimeType, file.originalName);
    const headers = new Headers();
    
    headers.set('Content-Type', file.mimeType);
    headers.set('Content-Disposition', `attachment; filename="${file.originalName}"`);
    headers.set('Content-Length', file.size.toString());
    headers.set('Cache-Control', 'no-cache');
    
    // Return mock file content based on file type
    return new NextResponse(mockFileContent, {
      status: 200,
      headers
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}

function generateMockFileContent(mimeType: string, filename: string): string {
  if (mimeType.startsWith('text/')) {
    return `This is a mock text file: ${filename}\nContent would be loaded from actual storage in a real implementation.\nGenerated at: ${new Date().toISOString()}`;
  } else if (mimeType === 'application/json') {
    return JSON.stringify({
      message: "Mock JSON file content",
      filename: filename,
      generatedAt: new Date().toISOString(),
      note: "In a real implementation, this would be the actual file content from storage"
    }, null, 2);
  } else if (mimeType === 'text/csv') {
    return `Name,Email,Date\nJohn Doe,john@example.com,${new Date().toISOString()}\nJane Smith,jane@example.com,${new Date().toISOString()}\n# Mock CSV content for ${filename}`;
  } else {
    return `Mock binary file content for ${filename}. In a real implementation, this would be the actual binary data from storage.`;
  }
}
import { type NextRequest, NextResponse } from 'next/server';
import { getAllFiles, removeFile, type UploadedFile } from '@/lib/data/files';

// POST /api/files/bulk - Bulk file operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, fileIds, filters } = body;

    if (!operation || !['delete', 'tag', 'untag'].includes(operation)) {
      return NextResponse.json(
        { error: 'Invalid operation. Supported operations: delete, tag, untag' },
        { status: 400 }
      );
    }

    let targetFiles: string[] = [];

    // Get files by IDs or filters
    if (fileIds && Array.isArray(fileIds)) {
      targetFiles = fileIds;
    } else if (filters) {
      const allFiles = getAllFiles();
      let filteredFiles = allFiles;

      if (filters.mimeType) {
        filteredFiles = filteredFiles.filter(f => f.mimeType.startsWith(filters.mimeType));
      }
      if (filters.olderThan) {
        const cutoffDate = new Date(filters.olderThan);
        filteredFiles = filteredFiles.filter(f => new Date(f.uploadedAt) < cutoffDate);
      }
      if (filters.largerThan) {
        filteredFiles = filteredFiles.filter(f => f.size > filters.largerThan);
      }
      if (filters.tags && Array.isArray(filters.tags)) {
        filteredFiles = filteredFiles.filter(f => 
          filters.tags.some((tag: string) => f.tags?.includes(tag))
        );
      }

      targetFiles = filteredFiles.map(f => f.id);
    }

    if (targetFiles.length === 0) {
      return NextResponse.json(
        { error: 'No files selected for bulk operation' },
        { status: 400 }
      );
    }

    const results = {
      operation,
      totalFiles: targetFiles.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ fileId: string; error: string }>
    };

    switch (operation) {
      case 'delete':
        for (const fileId of targetFiles) {
          try {
            const success = removeFile(fileId);
            if (success) {
              results.successful++;
            } else {
              results.failed++;
              results.errors.push({ fileId, error: 'File not found' });
            }
          } catch (error) {
            results.failed++;
            results.errors.push({ 
              fileId, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        }
        break;

      case 'tag':
      case 'untag':
        if (!body.tags || !Array.isArray(body.tags)) {
          return NextResponse.json(
            { error: 'Tags array is required for tag/untag operations' },
            { status: 400 }
          );
        }
        
        // In a real implementation, you would update file tags
        // For this mock, we'll just simulate the operation
        results.successful = targetFiles.length;
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported operation' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      ...results,
      message: `Bulk ${operation} completed: ${results.successful} successful, ${results.failed} failed`
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body or bulk operation failed' },
      { status: 400 }
    );
  }
}

// GET /api/files/bulk - Get bulk operation information
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/files/bulk',
    method: 'POST',
    supportedOperations: [
      {
        operation: 'delete',
        description: 'Delete multiple files',
        parameters: {
          fileIds: 'Array of file IDs to delete',
          filters: 'Object with filter criteria (mimeType, olderThan, largerThan, tags)'
        }
      },
      {
        operation: 'tag',
        description: 'Add tags to multiple files',
        parameters: {
          fileIds: 'Array of file IDs',
          tags: 'Array of tags to add'
        }
      },
      {
        operation: 'untag',
        description: 'Remove tags from multiple files',
        parameters: {
          fileIds: 'Array of file IDs',
          tags: 'Array of tags to remove'
        }
      }
    ],
    examples: {
      deleteByIds: {
        operation: 'delete',
        fileIds: ['file_123', 'file_456']
      },
      deleteByFilter: {
        operation: 'delete',
        filters: {
          mimeType: 'image/',
          olderThan: '2024-08-01T00:00:00Z'
        }
      },
      addTags: {
        operation: 'tag',
        fileIds: ['file_123', 'file_456'],
        tags: ['archived', 'processed']
      }
    }
  });
}
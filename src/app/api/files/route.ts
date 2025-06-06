import { type NextRequest, NextResponse } from 'next/server';
import { getAllFiles, type UploadedFile } from '@/lib/data/files';

// GET /api/files - List uploaded files with pagination and filtering
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const type = searchParams.get('type'); // Filter by MIME type prefix (e.g., 'image', 'application')
  const search = searchParams.get('search'); // Search in filename or description
  const sortBy = searchParams.get('sortBy') || 'uploadedAt'; // uploadedAt, size, name
  const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc, desc

  try {
    let allFiles = getAllFiles();

    // Filter by type if specified
    if (type) {
      allFiles = allFiles.filter(file => 
        file.mimeType.startsWith(type.toLowerCase())
      );
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      allFiles = allFiles.filter(file =>
        file.originalName.toLowerCase().includes(searchLower) ||
        file.description?.toLowerCase().includes(searchLower) ||
        file.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort files
    allFiles.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortBy) {
        case 'size':
          aVal = a.size;
          bVal = b.size;
          break;
        case 'name':
          aVal = a.originalName.toLowerCase();
          bVal = b.originalName.toLowerCase();
          break;
        case 'uploadedAt':
        default:
          aVal = new Date(a.uploadedAt).getTime();
          bVal = new Date(b.uploadedAt).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = allFiles.slice(startIndex, endIndex);

    // Calculate file type distribution
    const typeDistribution = allFiles.reduce((acc: any, file) => {
      const mainType = file.mimeType.split('/')[0];
      acc[mainType] = (acc[mainType] || 0) + 1;
      return acc;
    }, {});

    // Calculate total size
    const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);

    const response = {
      files: paginatedFiles.map(file => ({
        id: file.id,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
        url: file.url,
        description: file.description,
        tags: file.tags,
        updatedAt: file.updatedAt
      })),
      pagination: {
        page,
        limit,
        total: allFiles.length,
        pages: Math.ceil(allFiles.length / limit),
        hasNext: endIndex < allFiles.length,
        hasPrev: page > 1
      },
      statistics: {
        totalFiles: allFiles.length,
        totalSize,
        typeDistribution,
        averageSize: allFiles.length > 0 ? Math.round(totalSize / allFiles.length) : 0
      },
      filters: {
        availableTypes: Object.keys(typeDistribution),
        sortOptions: ['uploadedAt', 'size', 'name']
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve files' },
      { status: 500 }
    );
  }
}

// POST /api/files - Redirect to upload endpoint
export async function POST() {
  return NextResponse.json({
    error: 'Use /api/upload to upload files',
    uploadEndpoint: '/api/upload',
    method: 'POST',
    contentType: 'multipart/form-data',
    example: 'curl -X POST -F "files=@example.pdf" /api/upload'
  }, { status: 405 });
}
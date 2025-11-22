import { NextResponse } from 'next/server';
import { commentsStore } from '@/data/mock-comments';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('GET /api/comments/[id] called');
    try {
        const resolvedParams = await params;
        console.log('Params resolved:', resolvedParams);
        const resourceId = resolvedParams.id;
        console.log('ResourceId:', resourceId);
        const { searchParams } = new URL(request.url);
        const resourceType = searchParams.get('resourceType');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sort = searchParams.get('sort') || 'newest';

        let filteredComments = await commentsStore.getAll();

        // Filter by resourceId
        filteredComments = filteredComments.filter(c => c.resourceId === resourceId);

        if (resourceType) {
            filteredComments = filteredComments.filter(c => c.resourceType === resourceType);
        }

        // Sort
        filteredComments.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sort === 'oldest' ? dateA - dateB : dateB - dateA;
        });

        // Pagination
        const total = filteredComments.length;
        const start = (page - 1) * limit;
        const paginatedComments = filteredComments.slice(start, start + limit);

        // Calculate average rating
        const ratings = filteredComments.filter(c => c.rating).map(c => c.rating!);
        const averageRating = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;

        return NextResponse.json({
            comments: paginatedComments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            summary: {
                totalComments: total,
                averageRating: parseFloat(averageRating.toFixed(1))
            }
        });
    } catch (error) {
        console.error('Error in GET /api/comments/[id]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


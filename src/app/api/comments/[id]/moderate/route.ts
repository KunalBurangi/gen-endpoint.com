import { NextResponse } from 'next/server';
import { commentsStore } from '@/data/mock-comments';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const commentId = (await params).id;
        const body = await request.json();
        const { action, moderatorNote } = body;

        if (!['approve', 'reject', 'flag'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be approve, reject, or flag' },
                { status: 400 }
            );
        }

        const comment = await commentsStore.getById(commentId);

        if (!comment) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            );
        }

        const statusMap: Record<string, any> = {
            'approve': 'approved',
            'reject': 'rejected',
            'flag': 'flagged'
        };

        const updates = {
            status: statusMap[action],
            moderatedAt: new Date().toISOString(),
            moderatedBy: 'usr_current_admin',
            moderatorNote
        };

        await commentsStore.update(commentId, updates);

        return NextResponse.json({
            id: commentId,
            ...updates
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}

```typescript
import { NextResponse } from 'next/server';
import { commentsStore, type Comment } from '@/data/mock-comments';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { resourceType, resourceId, content, rating, parentId } = body;

        if (!resourceType || !resourceId || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: resourceType, resourceId, content' },
                { status: 400 }
            );
        }

        const newComment: Comment = {
            id: `comment_${ nanoid(6) } `,
            resourceType,
            resourceId,
            content,
            author: {
                id: "usr_current", // Mock current user
                name: "Current User",
                avatar: "https://placehold.co/40x40.png"
            },
            rating,
            parentId: parentId || null,
            status: 'pending_moderation',
            createdAt: new Date().toISOString(),
            replies: []
        };

        await commentsStore.add(newComment);

        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
```

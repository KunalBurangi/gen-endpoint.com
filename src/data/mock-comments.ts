import { JsonFileStore } from '@/lib/store';

export interface Comment {
    id: string;
    resourceType: string;
    resourceId: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatar: string;
    };
    rating?: number;
    parentId?: string | null;
    status: 'pending_moderation' | 'approved' | 'rejected' | 'flagged';
    createdAt: string;
    replies: Comment[];
    moderatedAt?: string;
    moderatedBy?: string;
    moderatorNote?: string;
}

const defaultComments: Comment[] = [
    {
        id: "comment_123",
        resourceType: "product",
        resourceId: "prod_123",
        content: "Great product! Highly recommended.",
        author: {
            id: "usr_456",
            name: "Jane Doe",
            avatar: "https://placehold.co/40x40.png"
        },
        rating: 5,
        status: "approved",
        createdAt: "2024-08-17T10:00:00Z",
        replies: [
            {
                id: "comment_124",
                resourceType: "product",
                resourceId: "prod_123",
                content: "Glad you liked it!",
                author: {
                    id: "usr_3",
                    name: "Charlie",
                    avatar: "https://placehold.co/40x40.png"
                },
                status: "approved",
                createdAt: "2024-08-17T11:00:00Z",
                replies: [],
                parentId: "comment_123"
            }
        ]
    }
];

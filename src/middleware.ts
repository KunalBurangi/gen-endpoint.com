import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock token for demonstration
const VALID_TOKEN = 'mock_token';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
    '/api/inventory/adjust',
    '/api/inventory/reserve',
    '/api/comments/*/moderate',
    '/api/jobs',
    '/api/webhooks',
    '/api/devices/register',
];

// Helper to check if a path matches protected routes
function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(route => {
        // Convert wildcard pattern to regex
        const pattern = route.replace(/\*/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(pathname);
    });
}

// Helper to check if method requires authentication
function requiresAuth(pathname: string, method: string): boolean {
    // POST, PUT, DELETE operations on protected routes require auth
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
        return isProtectedRoute(pathname);
    }
    return false;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const method = request.method;

    // Check for chaos mode cookie
    const chaosMode = request.cookies.get('chaos-mode')?.value === 'true';

    // Apply chaos mode effects if enabled
    if (chaosMode && pathname.startsWith('/api/')) {
        const random = Math.random();

        // 20% chance of random error
        if (random < 0.2) {
            return NextResponse.json(
                { error: 'Chaos Mode: Random server error', chaosMode: true },
                { status: 500 }
            );
        }

        // 30% chance of random delay (simulated via header, actual delay would block)
        // In a real scenario, you'd use setTimeout, but middleware should be fast
        // So we'll add a header to indicate delay happened
        if (random < 0.5) {
            const response = NextResponse.next();
            response.headers.set('X-Chaos-Delay', `${Math.floor(Math.random() * 1900) + 100}ms`);
            return response;
        }
    }

    // Check authentication for protected routes
    if (requiresAuth(pathname, method)) {
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authentication required. Please provide an Authorization header.' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');

        if (token !== VALID_TOKEN) {
            return NextResponse.json(
                { error: 'Invalid token. Use "Bearer mock_token" for demonstration.' },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
    matcher: '/api/:path*',
};

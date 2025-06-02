
import { NextResponse } from 'next/server';

// GET /api/auth/status
// This is a mock. In a real app, you'd check a valid session/token.
let isAuthenticatedMock = true; // You could toggle this for testing

export async function GET() {
  if (isAuthenticatedMock) {
    return NextResponse.json({
      isAuthenticated: true,
      // Typically, you'd get user details from the validated session/token
      user: { id: "usr_1", name: "Alice Wonderland", email: "alice@example.com", role: "admin" }, 
      checkedAt: new Date().toISOString()
    });
  } else {
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
      checkedAt: new Date().toISOString()
    });
  }
}


import { type NextRequest, NextResponse } from 'next/server';

interface Params {
  qrId: string;
}

// GET /api/qr/{qrId}/download.svg - Serve a mock SVG image for download
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { qrId } = params;

  const svgContent = `
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#f0f0f0"/>
  <text x="10" y="50" font-family="Arial" font-size="10" fill="#333">Mock QR for ${qrId}</text>
  <rect x="25" y="25" width="50" height="50" fill="none" stroke="#000" stroke-width="2"/>
</svg>
  `.trim();

  const headers = new Headers();
  headers.set('Content-Type', 'image/svg+xml');
  headers.set('Content-Disposition', `attachment; filename="${qrId}_qrcode.svg"`);
  headers.set('X-Mock-QR-ID', qrId);

  return new NextResponse(svgContent, {
    status: 200,
    headers,
  });
}

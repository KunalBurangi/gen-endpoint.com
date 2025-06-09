
import { type NextRequest, NextResponse } from 'next/server';

interface Params {
  qrId: string;
}

// GET /api/qr/{qrId}/download.png - Serve a mock PNG image for download
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { qrId } = params;

  // Tiny transparent 1x1 PNG
  const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const imageBuffer = Buffer.from(base64Png, 'base64');

  const headers = new Headers();
  headers.set('Content-Type', 'image/png');
  headers.set('Content-Disposition', `attachment; filename="${qrId}_qrcode.png"`);
  headers.set('Content-Length', imageBuffer.length.toString());
  headers.set('X-Mock-QR-ID', qrId);

  return new NextResponse(imageBuffer, {
    status: 200,
    headers,
  });
}

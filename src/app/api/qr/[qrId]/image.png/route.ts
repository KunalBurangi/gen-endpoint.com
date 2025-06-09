
import { type NextRequest, NextResponse } from 'next/server';

interface Params {
  qrId: string;
}

// GET /api/qr/{qrId}/image.png - Serve a mock PNG image
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { qrId } = params;

  // Tiny transparent 1x1 PNG
  const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const imageBuffer = Buffer.from(base64Png, 'base64');

  return new NextResponse(imageBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length.toString(),
      'X-Mock-QR-ID': qrId, // Custom header to indicate it's a mock
    },
  });
}

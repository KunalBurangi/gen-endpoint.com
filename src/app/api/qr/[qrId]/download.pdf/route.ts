
import { type NextRequest, NextResponse } from 'next/server';

interface Params {
  qrId: string;
}

// GET /api/qr/{qrId}/download.pdf - Serve a mock PDF for download
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { qrId } = params;

  // In a real app, you'd generate a PDF containing the QR code.
  // For this mock, we'll return a simple text message.
  const mockPdfContent = `This is a mock PDF for QR Code ID: ${qrId}.\nIn a real application, this file would contain the QR code image.`;

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', `attachment; filename="${qrId}_qrcode.pdf"`);
  headers.set('X-Mock-QR-ID', qrId);

  return new NextResponse(mockPdfContent, {
    status: 200,
    headers,
  });
}

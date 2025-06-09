
import { type NextRequest, NextResponse } from 'next/server';

interface Params {
  qrId: string;
}

// Mock QR code data store
const mockQrCodes: { [id: string]: any } = {
  "qr_456": {
    id: "qr_456",
    data: "https://www.example.com",
    size: 256,
    format: "png",
    imageUrl: "/api/qr/qr_456/image.png",
    downloadUrls: {
      png: "/api/qr/qr_456/download.png",
      svg: "/api/qr/qr_456/download.svg",
      pdf: "/api/qr/qr_456/download.pdf"
    },
    scanCount: 45, // Mock scan count
    createdAt: "2024-08-16T12:00:00Z"
  }
};

// GET /api/qr/{qrId} - Get QR code metadata and download links
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { qrId } = params;

  const qrCode = mockQrCodes[qrId];

  if (qrCode) {
    return NextResponse.json(qrCode);
  } else {
    // Return a generic mock if not found, to allow testing with generated IDs
    return NextResponse.json({
      id: qrId,
      data: `Mock data for ${qrId}`,
      imageUrl: `/api/qr/${qrId}/image.png`,
      downloadUrls: {
        png: `/api/qr/${qrId}/download.png`,
        svg: `/api/qr/${qrId}/download.svg`,
        pdf: `/api/qr/${qrId}/download.pdf`
      },
      scanCount: Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString(),
      message: "This is a dynamically generated mock response as the specific ID was not pre-defined."
    });
  }
}

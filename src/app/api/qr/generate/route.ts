
import { type NextRequest, NextResponse } from 'next/server';

let qrCounter = 456;

function generateQrId(): string {
  return `qr_${qrCounter++}`;
}

// POST /api/qr/generate - Generate QR code image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, size = 256, format = "png", errorCorrection = "M" } = body;

    if (!data) {
      return NextResponse.json({ error: "Missing 'data' field in request body" }, { status: 400 });
    }

    const qrId = generateQrId();
    const createdAt = new Date().toISOString();

    // In a real app, you would generate the QR code here and store it or its metadata.
    // For this mock, we'll just return the metadata.

    const response = {
      id: qrId,
      imageUrl: `/api/qr/${qrId}/image.png`, // Path to view the image
      data,
      size,
      format,
      errorCorrection,
      createdAt,
      message: "QR code generation request accepted. This is a mock response.",
      downloadUrls: { // Adding download URLs here as well, consistent with GET /api/qr/{qrId}
        png: `/api/qr/${qrId}/download.png`,
        svg: `/api/qr/${qrId}/download.svg`,
        pdf: `/api/qr/${qrId}/download.pdf`
      }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body or QR generation error" },
      { status: 400 }
    );
  }
}

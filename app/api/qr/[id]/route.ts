import QRCode from 'qrcode';
import type { NextRequest } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const svg = await QRCode.toString(id, {
      type: 'svg',
      margin: 2,
      width: 200,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    });

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}

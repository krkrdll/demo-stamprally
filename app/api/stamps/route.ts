import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/stamps?sessionId=xxx
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

  const session = await prisma.userSession.upsert({
    where: { id: sessionId },
    create: { id: sessionId },
    update: {},
    include: { stamps: { orderBy: { collectedAt: 'asc' } } },
  });

  return NextResponse.json(session.stamps);
}

// POST /api/stamps
// body: { sessionId, checkpointId, title }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sessionId, checkpointId, title } = body as {
    sessionId: string;
    checkpointId: string;
    title: string;
  };
  if (!sessionId || !checkpointId || !title) {
    return NextResponse.json({ error: 'sessionId, checkpointId, title required' }, { status: 400 });
  }

  await prisma.userSession.upsert({
    where: { id: sessionId },
    create: { id: sessionId },
    update: {},
  });

  const stamp = await prisma.userStamp.upsert({
    where: { sessionId_checkpointId: { sessionId, checkpointId } },
    create: {
      id: crypto.randomUUID(),
      sessionId,
      checkpointId,
      title,
    },
    update: {},
  });

  return NextResponse.json(stamp, { status: 201 });
}

// DELETE /api/stamps?sessionId=xxx
export async function DELETE(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

  await prisma.userStamp.deleteMany({ where: { sessionId } });

  return NextResponse.json({ ok: true });
}

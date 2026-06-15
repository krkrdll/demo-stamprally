'use server';

import prisma from '@/lib/prisma';

export async function verifyPasscode(checkpointId: string, entered: string): Promise<boolean> {
  const checkpoint = await prisma.checkpoint.findUnique({ where: { id: checkpointId } });
  if (!checkpoint || checkpoint.type !== 'passcode' || !checkpoint.passcode) return false;
  return checkpoint.passcode === entered.trim();
}

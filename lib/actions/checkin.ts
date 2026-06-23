'use server';

import prisma from '@/lib/prisma';

export async function verifyPasscode(conditionId: string, entered: string): Promise<boolean> {
  const condition = await prisma.checkpointCondition.findUnique({ where: { id: conditionId } });
  if (!condition || condition.type !== 'passcode' || !condition.passcode) return false;
  return condition.passcode === entered.trim();
}

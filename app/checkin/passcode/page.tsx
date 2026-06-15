import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import PasscodeCheckinClient from '@/components/PasscodeCheckinClient';

export default async function PasscodeCheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  const checkpoint = await prisma.checkpoint.findUnique({ where: { id } });
  if (!checkpoint || checkpoint.type !== 'passcode') notFound();

  return (
    <PasscodeCheckinClient
      checkpointId={checkpoint.id}
      title={checkpoint.title}
      description={checkpoint.description}
    />
  );
}

import { notFound } from 'next/navigation';
import { getCheckpointById } from '@/lib/checkpoints';
import MultiConditionCheckinClient from '@/components/MultiConditionCheckinClient';

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const checkpoint = await getCheckpointById(id);
  if (!checkpoint || checkpoint.conditions.length === 0) notFound();

  return <MultiConditionCheckinClient checkpoint={checkpoint} />;
}

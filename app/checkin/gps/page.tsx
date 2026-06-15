import { getGpsCheckpoints } from '@/lib/checkpoints';
import GpsCheckinClient from '@/components/GpsCheckinClient';

export default async function GpsCheckinPage() {
  const checkpoints = await getGpsCheckpoints();
  return <GpsCheckinClient checkpoints={checkpoints} />;
}

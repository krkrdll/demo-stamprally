import { getGpsCheckpoints } from '@/lib/checkpoints';
import GpsCheckinClient from '@/components/GpsCheckinClient';

export default function GpsCheckinPage() {
  const checkpoints = getGpsCheckpoints();
  return <GpsCheckinClient checkpoints={checkpoints} />;
}

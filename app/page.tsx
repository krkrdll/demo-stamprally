import { getAllCheckpoints } from '@/lib/checkpoints';
import StampRallyHome from '@/components/StampRallyHome';

export default function HomePage() {
  const checkpoints = getAllCheckpoints();
  return <StampRallyHome checkpoints={checkpoints} />;
}

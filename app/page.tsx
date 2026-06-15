import { getAllCheckpoints } from '@/lib/checkpoints';
import StampRallyHome from '@/components/StampRallyHome';

export default async function HomePage() {
  const checkpoints = await getAllCheckpoints();
  return <StampRallyHome checkpoints={checkpoints} />;
}

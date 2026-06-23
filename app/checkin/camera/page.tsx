export const dynamic = 'force-dynamic';

import { getMarkerCheckpoints } from '@/lib/checkpoints';
import CameraCheckinClient from '@/components/CameraCheckinClient';

export default async function CameraCheckinPage() {
  const checkpoints = await getMarkerCheckpoints();
  return <CameraCheckinClient checkpoints={checkpoints} />;
}

import { getMarkerCheckpoints } from '@/lib/checkpoints';
import CameraCheckinClient from '@/components/CameraCheckinClient';

export default function CameraCheckinPage() {
  const checkpoints = getMarkerCheckpoints();
  return <CameraCheckinClient checkpoints={checkpoints} />;
}

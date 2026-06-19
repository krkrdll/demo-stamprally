export const dynamic = 'force-dynamic';

import { getAllCheckpoints } from '@/lib/checkpoints';
import { getSiteSettings } from '@/lib/settings';
import CheckpointsMapClient from '@/components/CheckpointsMapClient';

export default async function MapPage() {
  const [checkpoints, settings] = await Promise.all([
    getAllCheckpoints(),
    getSiteSettings(),
  ]);
  return <CheckpointsMapClient checkpoints={checkpoints} siteTitle={settings.siteTitle} />;
}

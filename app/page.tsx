export const dynamic = 'force-dynamic';

import { getAllCheckpoints } from '@/lib/checkpoints';
import { getSiteSettings } from '@/lib/settings';
import StampRallyHome from '@/components/StampRallyHome';

export default async function HomePage() {
  const [checkpoints, settings] = await Promise.all([
    getAllCheckpoints(),
    getSiteSettings(),
  ]);
  return <StampRallyHome checkpoints={checkpoints} siteTitle={settings.siteTitle} />;
}

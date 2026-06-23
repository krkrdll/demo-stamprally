'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useStamps } from '@/hooks/useStamps';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { Checkpoint } from '@/lib/types';
import type { GpsPin } from './CheckpointsMapLeaflet';
import { MdArrowBack, MdAdjust, MdGpsFixed, MdGpsOff } from 'react-icons/md';

const CheckpointsMapLeaflet = dynamic(() => import('./CheckpointsMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
      地図を読み込み中...
    </div>
  ),
});

type Props = {
  checkpoints: Checkpoint[];
  siteTitle: string;
};

export default function CheckpointsMapClient({ checkpoints, siteTitle }: Props) {
  const router = useRouter();
  const { hasStamp, ready } = useStamps();
  const { lat, lng, error: geoError, loading: geoLoading } = useGeolocation();

  const pins: GpsPin[] = checkpoints.flatMap(cp => {
    const gpsCond = cp.conditions.find(c => c.type === 'gps');
    if (!gpsCond || gpsCond.type !== 'gps') return [];
    return [{
      id: cp.id,
      title: cp.title,
      lat: gpsCond.lat,
      lng: gpsCond.lng,
      collected: ready ? hasStamp(cp.id) : false,
    }];
  });

  const collectedCount = pins.filter(p => p.collected).length;

  return (
    <div className="flex flex-col h-screen">
      <header className="flex-none theme-bg text-white px-4 py-3 flex items-center gap-3 shadow z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          aria-label="戻る"
        >
          <MdArrowBack size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold leading-tight truncate">{siteTitle}</h1>
          <p className="text-xs theme-text-muted leading-tight">
            GPSスポット {collectedCount} / {pins.length} 達成
          </p>
        </div>
        <div className="flex-none">
          {geoLoading ? (
            <MdGpsFixed size={20} className="animate-pulse opacity-60" />
          ) : geoError ? (
            <MdGpsOff size={20} className="opacity-50" />
          ) : (
            <MdGpsFixed size={20} />
          )}
        </div>
      </header>

      <div className="flex-1 relative min-h-0">
        <CheckpointsMapLeaflet pins={pins} userLat={lat} userLng={lng} />
      </div>

      <div className="flex-none bg-white border-t border-gray-100 px-4 py-3 max-h-48 overflow-y-auto">
        {pins.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">GPS対応スポットがありません</p>
        ) : (
          <ul className="space-y-1.5">
            {pins.map(pin => (
              <li key={pin.id} className="flex items-center gap-2.5">
                <span
                  className={`w-3 h-3 rounded-full flex-none ${pin.collected ? 'bg-green-500' : 'bg-amber-500'}`}
                />
                <span className={`text-sm truncate ${pin.collected ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                  {pin.title}
                </span>
                {pin.collected && (
                  <MdAdjust size={14} className="flex-none text-green-500 ml-auto" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

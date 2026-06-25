'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStamps } from '@/hooks/useStamps';
import { useGeolocation } from '@/hooks/useGeolocation';
import { haversineDistance } from '@/lib/distance';
import type { Checkpoint, ConditionGps } from '@/lib/types';
import type { GpsPin } from './CheckpointsMapLeaflet';
import {
  MdArrowBack,
  MdAdjust,
  MdGpsFixed,
  MdGpsOff,
  MdCheckCircle,
  MdLocationOn,
  MdQrCodeScanner,
  MdKey,
  MdHelp,
} from 'react-icons/md';

const CheckpointsMapLeaflet = dynamic(() => import('./CheckpointsMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
      地図を読み込み中...
    </div>
  ),
});

const CONDITION_ICON: Record<string, React.ReactNode> = {
  gps: <MdGpsFixed />,
  marker: <MdQrCodeScanner />,
  passcode: <MdKey />,
};

const CONDITION_LABEL: Record<string, string> = {
  gps: 'GPS で現在地を確認',
  marker: 'カメラでマーカーをスキャン',
  passcode: '合言葉を入力',
};

type Props = {
  checkpoints: Checkpoint[];
  siteTitle: string;
};

export default function CheckpointsMapClient({ checkpoints, siteTitle }: Props) {
  const router = useRouter();
  const { hasStamp, ready } = useStamps();
  const { lat, lng, error: geoError, loading: geoLoading } = useGeolocation();
  const [selectedPin, setSelectedPin] = useState<GpsPin | null>(null);

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

  // Derived values for selected pin sheet
  const selectedCheckpoint = selectedPin
    ? (checkpoints.find(cp => cp.id === selectedPin.id) ?? null)
    : null;
  const selectedGpsCond = selectedCheckpoint?.conditions.find(
    (c): c is ConditionGps => c.type === 'gps'
  ) ?? null;
  const dist =
    selectedPin !== null && lat !== null && lng !== null
      ? haversineDistance(lat, lng, selectedPin.lat, selectedPin.lng)
      : null;
  const inRange =
    dist !== null && selectedGpsCond !== null && dist <= selectedGpsCond.radiusMeters;

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
        <CheckpointsMapLeaflet
          pins={pins}
          userLat={lat}
          userLng={lng}
          onPinClick={setSelectedPin}
        />
      </div>

      <div className="flex-none bg-white border-t border-gray-100 px-4 py-3 max-h-48 overflow-y-auto">
        {pins.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">GPS対応スポットがありません</p>
        ) : (
          <ul className="space-y-1.5">
            {pins.map(pin => (
              <li key={pin.id}>
                <button
                  type="button"
                  onClick={() => setSelectedPin(pin)}
                  className="w-full flex items-center gap-2.5 text-left active:bg-gray-50 rounded-lg px-1 py-0.5 transition-colors"
                >
                  <span
                    className={`w-3 h-3 rounded-full flex-none ${pin.collected ? 'bg-green-500' : 'bg-amber-500'}`}
                  />
                  <span className={`text-sm truncate ${pin.collected ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                    {pin.title}
                  </span>
                  {pin.collected ? (
                    <MdAdjust size={14} className="flex-none text-green-500 ml-auto" />
                  ) : (
                    <MdLocationOn size={14} className="flex-none text-amber-500 ml-auto" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedPin && selectedCheckpoint && (
        <div
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-[rgba(20,19,42,0.5)] backdrop-blur-sm"
          onClick={() => setSelectedPin(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-[28px] bg-[var(--surface)] p-7"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-[var(--hairline)]" />

            <div className="mb-6 text-center">
              <p className="overline text-[11px] mb-2">Check in</p>
              <h2 className="font-display text-2xl uppercase leading-none text-[var(--ink)]">
                {selectedPin.title}
              </h2>

              <div className="mt-5 space-y-2 text-left">
                {selectedCheckpoint.conditions.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-xl bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--ink-soft)]"
                  >
                    <span className="text-lg text-[var(--color-brand)]">
                      {CONDITION_ICON[c.type] ?? <MdHelp />}
                    </span>
                    <span className="font-light">
                      {CONDITION_LABEL[c.type] ?? c.type}
                    </span>
                    {selectedCheckpoint.conditions.length > 1 && (
                      <span className="ml-auto font-mono text-[11px] text-[var(--muted-2)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {selectedCheckpoint.conditions.length > 1 && (
                <p className="mt-3 text-xs font-light text-[var(--muted-2)]">
                  すべての条件を満たすとスタンプ獲得
                </p>
              )}
            </div>

            {/* Distance feedback */}
            {!selectedPin.collected && dist !== null && !inRange && selectedGpsCond && (
              <p className="mb-3 text-center text-xs text-[var(--muted)]">
                {Math.round(dist)}m 離れています（{selectedGpsCond.radiusMeters}m 以内でチェックイン可能）
              </p>
            )}
            {!selectedPin.collected && dist === null && (
              <p className="mb-3 text-center text-xs text-[var(--muted)]">
                現在地を取得中...
              </p>
            )}

            {selectedPin.collected ? (
              <div className="mb-3 flex items-center justify-center gap-2 h-[54px] rounded-2xl bg-green-50 text-green-700 font-medium text-sm">
                <MdCheckCircle size={18} />
                スタンプ獲得済み
              </div>
            ) : (
              <button
                type="button"
                onClick={() => router.push(`/checkin/${selectedPin.id}`)}
                disabled={!inRange}
                className="sunset-cta mb-3 h-[54px] w-full text-base transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                チェックインする
              </button>
            )}
            <button
              onClick={() => setSelectedPin(null)}
              className="w-full py-2 text-sm font-light text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

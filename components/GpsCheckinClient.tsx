'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStamps } from '@/hooks/useStamps';
import { useGeolocation } from '@/hooks/useGeolocation';
import { haversineDistance } from '@/lib/distance';
import type { GpsCheckpoint } from '@/lib/types';

const RANGE_METERS = 20;

type Props = {
  checkpoints: GpsCheckpoint[];
};

export default function GpsCheckinClient({ checkpoints }: Props) {
  const router = useRouter();
  const { lat, lng, accuracy, error, loading } = useGeolocation();
  const { hasStamp, addStamp } = useStamps();
  const [demoLat, setDemoLat] = useState<number | null>(null);
  const [demoLng, setDemoLng] = useState<number | null>(null);
  const [collectedId, setCollectedId] = useState<string | null>(null);

  const usedLat = demoLat ?? lat;
  const usedLng = demoLng ?? lng;

  const collectStamp = useCallback(
    (cp: GpsCheckpoint) => {
      addStamp(cp.id, cp.title);
      setCollectedId(cp.id);
      setTimeout(() => router.push('/'), 2000);
    },
    [addStamp, router]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📡</div>
          <div className="text-gray-500 font-medium">位置情報を取得中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {collectedId && (
        <div className="fixed inset-0 bg-amber-400 flex items-center justify-center z-50">
          <div className="text-center text-white animate-bounce">
            <div className="text-8xl mb-4">🟠</div>
            <div className="text-3xl font-bold">スタンプゲット！</div>
          </div>
        </div>
      )}

      <header className="bg-blue-600 text-white px-4 py-4 flex items-center gap-3 shadow">
        <button
          onClick={() => router.back()}
          className="text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-500 transition-colors"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">GPS チェックイン</h1>
      </header>

      <div className="p-4 max-w-lg mx-auto space-y-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
            現在地
          </div>
          {error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <>
              <div className="font-mono text-sm text-gray-700">
                {usedLat?.toFixed(5)}, {usedLng?.toFixed(5)}
              </div>
              {accuracy !== null && demoLat === null && (
                <div className="text-xs text-gray-400 mt-0.5">精度: ±{Math.round(accuracy)}m</div>
              )}
              {demoLat !== null && (
                <div className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>デモ位置を使用中</span>
                </div>
              )}
            </>
          )}
        </div>

        {checkpoints.map(cp => {
          const dist =
            usedLat !== null && usedLng !== null
              ? haversineDistance(usedLat, usedLng, cp.lat, cp.lng)
              : null;
          const inRange = dist !== null && dist <= RANGE_METERS;
          const alreadyHas = hasStamp(cp.id);

          return (
            <div key={cp.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800">{cp.title}</div>
                  {cp.description && (
                    <div className="text-xs text-gray-400 mt-0.5">{cp.description}</div>
                  )}
                  <div className="mt-2 text-sm">
                    {alreadyHas ? (
                      <span className="text-amber-600 font-medium">✅ 取得済み</span>
                    ) : dist !== null ? (
                      inRange ? (
                        <span className="text-green-600 font-bold">✅ 範囲内！（{Math.round(dist)}m）</span>
                      ) : (
                        <span className="text-gray-500">📏 {Math.round(dist)}m 離れています</span>
                      )
                    ) : (
                      <span className="text-gray-300">距離計算中...</span>
                    )}
                  </div>
                </div>
                <div className="text-3xl flex-shrink-0">{alreadyHas ? '🟠' : '⭕'}</div>
              </div>

              {!alreadyHas && inRange && (
                <button
                  onClick={() => collectStamp(cp)}
                  className="mt-3 w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold py-2.5 rounded-lg transition-all"
                >
                  スタンプをゲット！
                </button>
              )}

              {!alreadyHas && !inRange && (
                <button
                  onClick={() => {
                    setDemoLat(cp.lat);
                    setDemoLng(cp.lng);
                  }}
                  className="mt-3 w-full bg-gray-50 hover:bg-gray-100 text-gray-400 text-xs py-2 rounded-lg border border-dashed border-gray-200 transition-colors"
                >
                  🔧 デモ: この場所にいると仮定する
                </button>
              )}
            </div>
          );
        })}

        {demoLat !== null && (
          <button
            onClick={() => {
              setDemoLat(null);
              setDemoLng(null);
            }}
            className="w-full text-xs text-gray-400 underline underline-offset-2 py-2"
          >
            デモ位置をリセットして実際の位置に戻す
          </button>
        )}
      </div>
    </div>
  );
}

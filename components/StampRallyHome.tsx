'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStamps } from '@/hooks/useStamps';
import type { Checkpoint } from '@/lib/types';
import StampCard from './StampCard';

type Props = {
  checkpoints: Checkpoint[];
};

export default function StampRallyHome({ checkpoints }: Props) {
  const router = useRouter();
  const { stamps, hasStamp, clearAll, ready } = useStamps();
  const [showModal, setShowModal] = useState(false);

  const collectedCount = ready ? stamps.length : 0;
  const allCollected = collectedCount === checkpoints.length && collectedCount > 0;

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-amber-600 text-white px-4 py-5 text-center shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">🗺️ スタンプラリー</h1>
        <p className="text-amber-100 text-sm mt-1">
          {ready
            ? `${collectedCount} / ${checkpoints.length} スタンプ獲得`
            : '読み込み中...'}
        </p>
      </header>

      <main className="p-4 max-w-lg mx-auto pb-28">
        {allCollected && (
          <div className="bg-amber-500 text-white rounded-xl p-4 text-center mb-4 shadow-lg">
            <div className="text-4xl mb-1">🎉</div>
            <div className="font-bold text-lg">全スタンプコンプリート！</div>
            <div className="text-amber-100 text-sm mt-1">おめでとうございます！</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {checkpoints.map(cp => (
            <StampCard
              key={cp.id}
              checkpoint={cp}
              collected={ready ? hasStamp(cp.id) : false}
              collectedAt={stamps.find(s => s.checkpointId === cp.id)?.collectedAt}
            />
          ))}
        </div>

        {ready && stamps.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 underline underline-offset-2"
            >
              スタンプをリセット（デモ用）
            </button>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-10">
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold py-4 px-10 rounded-full shadow-xl text-lg transition-all"
        >
          📍 チェックイン
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl p-6 w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h2 className="text-xl font-bold text-center mb-1">チェックイン方法を選択</h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              どちらの方法でチェックインしますか？
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => router.push('/checkin/gps')}
                className="flex flex-col items-center gap-2 bg-blue-50 hover:bg-blue-100 active:scale-95 border-2 border-blue-200 rounded-xl p-5 transition-all"
              >
                <span className="text-4xl">📡</span>
                <span className="font-bold text-blue-700">GPS</span>
                <span className="text-xs text-gray-500 text-center leading-relaxed">
                  現在地を確認して
                  <br />
                  スタンプをゲット
                </span>
              </button>
              <button
                onClick={() => router.push('/checkin/camera')}
                className="flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100 active:scale-95 border-2 border-green-200 rounded-xl p-5 transition-all"
              >
                <span className="text-4xl">📷</span>
                <span className="font-bold text-green-700">カメラ</span>
                <span className="text-xs text-gray-500 text-center leading-relaxed">
                  マーカーをスキャンして
                  <br />
                  スタンプをゲット
                </span>
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full text-gray-400 py-2 text-sm hover:text-gray-600 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

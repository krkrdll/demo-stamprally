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
  const [selected, setSelected] = useState<Checkpoint | null>(null);

  const collectedCount = ready ? stamps.length : 0;
  const allCollected = collectedCount === checkpoints.length && collectedCount > 0;

  function handleConfirm() {
    if (!selected) return;
    if (selected.type === 'gps') {
      router.push(`/checkin/gps?id=${selected.id}`);
    } else if (selected.type === 'passcode') {
      router.push(`/checkin/passcode?id=${selected.id}`);
    } else {
      router.push('/checkin/camera');
    }
    setSelected(null);
  }

  return (
    <div className="min-h-screen theme-bg-light">
      <header className="theme-bg text-white px-4 py-5 text-center shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">スタンプラリー</h1>
        <p className="theme-text-muted text-sm mt-1">
          {ready
            ? `${collectedCount} / ${checkpoints.length} スタンプ獲得`
            : '読み込み中...'}
        </p>
      </header>

      <main className="p-4 max-w-lg mx-auto pb-8">
        {allCollected && (
          <div className="theme-bg-mid text-white rounded-xl p-4 text-center mb-4 shadow-lg">
            <div className="text-4xl mb-1">🎉</div>
            <div className="font-bold text-lg">全スタンプコンプリート！</div>
            <div className="theme-text-muted text-sm mt-1">おめでとうございます！</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {checkpoints.map(cp => {
            const collected = ready ? hasStamp(cp.id) : false;
            return (
              <button
                key={cp.id}
                type="button"
                disabled={collected}
                onClick={() => setSelected(cp)}
                className="w-full text-left disabled:cursor-default active:scale-95 transition-transform"
              >
                <StampCard
                  checkpoint={cp}
                  collected={collected}
                  collectedAt={stamps.find(s => s.checkpointId === cp.id)?.collectedAt}
                />
              </button>
            );
          })}
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

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-t-2xl p-6 w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">
                {selected.type === 'gps' ? '📡' : selected.type === 'passcode' ? '🔑' : '📷'}
              </div>
              <h2 className="text-lg font-bold text-gray-800">{selected.title}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {selected.type === 'gps'
                  ? 'GPS で現在地を確認してチェックインします'
                  : selected.type === 'passcode'
                  ? '合言葉を入力してチェックインします'
                  : 'カメラでマーカーをスキャンしてチェックインします'}
              </p>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full theme-bg active:scale-95 text-white font-bold py-3 rounded-xl transition-all mb-3"
            >
              チェックインする
            </button>
            <button
              onClick={() => setSelected(null)}
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

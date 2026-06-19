'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStamps } from '@/hooks/useStamps';
import type { Checkpoint } from '@/lib/types';
import StampCard from './StampCard';
import { MdGpsFixed, MdQrCodeScanner, MdKey, MdHelp, MdCelebration, MdMap } from 'react-icons/md';

type Props = {
  checkpoints: Checkpoint[];
  siteTitle: string;
};

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

export default function StampRallyHome({ checkpoints, siteTitle }: Props) {
  const router = useRouter();
  const { stamps, hasStamp, clearAll, ready } = useStamps();
  const [selected, setSelected] = useState<Checkpoint | null>(null);

  const collectedCount = ready ? stamps.length : 0;
  const allCollected = collectedCount === checkpoints.length && collectedCount > 0;

  function handleConfirm() {
    if (!selected) return;
    router.push(`/checkin/${selected.id}`);
    setSelected(null);
  }

  return (
    <div className="min-h-screen theme-bg-light">
      <header className="sticky top-0 z-30 theme-bg text-white px-4 py-2 text-center shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">{siteTitle}</h1>
        <p className="theme-text-muted text-sm mt-1">
          {ready
            ? `${collectedCount} / ${checkpoints.length} スタンプ獲得`
            : '読み込み中...'}
        </p>
      </header>

      <main className="p-4 max-w-lg mx-auto pb-24">

        {allCollected && (
          <div className="theme-bg-mid text-white rounded-xl p-4 text-center mb-4 shadow-lg">
            <MdCelebration size={40} className="mx-auto mb-1" />
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

      {checkpoints.some(cp => cp.conditions.some(c => c.type === 'gps')) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-md shadow-lg z-40">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => router.push('/map')}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-sm"
            >
              <MdMap size={18} className="theme-text" />
              マップで確認する
            </button>
          </div>
        </div>
      )}

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
              <h2 className="text-lg font-bold text-gray-800 mb-3">{selected.title}</h2>
              <div className="space-y-2">
                {selected.conditions.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-lg flex-shrink-0">
                      {CONDITION_ICON[c.type] ?? <MdHelp />}
                    </span>
                    <span>{CONDITION_LABEL[c.type] ?? c.type}</span>
                    {selected.conditions.length > 1 && (
                      <span className="ml-auto text-xs text-gray-400">条件{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>
              {selected.conditions.length > 1 && (
                <p className="text-xs text-gray-400 mt-3">すべての条件を満たすとスタンプ獲得</p>
              )}
            </div>
            <button
              onClick={handleConfirm}
              className="w-full theme-bg active:scale-95 text-white font-bold py-3 rounded-xl transition-all mb-3"
            >
              開く
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStamps } from '@/hooks/useStamps';
import type { Checkpoint } from '@/lib/types';
import StampCard from './StampCard';
import { MdGpsFixed, MdQrCodeScanner, MdKey, MdHelp, MdMap } from 'react-icons/md';

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

  const total = checkpoints.length;
  const collectedCount = ready ? stamps.length : 0;
  const allCollected = collectedCount === total && collectedCount > 0;
  const pct = total > 0 ? Math.round((collectedCount / total) * 100) : 0;

  function handleConfirm() {
    if (!selected) return;
    router.push(`/checkin/${selected.id}`);
    setSelected(null);
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] pb-28">
      {/* ── HEADER ── */}
      <header className="px-6 pt-12 pb-7">
        <p className="overline text-[11px] mb-2.5">
          Campaign Microsite — Mobile Stamp Rally
        </p>
        <h1 className="font-display text-[clamp(38px,11vw,56px)] uppercase leading-[0.9] tracking-[-0.02em] text-[var(--ink)]">
          {siteTitle}
        </h1>

        {/* progress */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <span className="overline text-[11px]">Stamps Collected</span>
            <span className="font-mono text-sm text-[var(--muted)]">
              {ready ? (
                <>
                  <span className="text-lg text-[var(--color-brand)]">
                    {collectedCount}
                  </span>{' '}
                  / {total}
                </>
              ) : (
                '読み込み中…'
              )}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--hairline)]">
            <div
              className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6">
        {/* completion banner */}
        {allCollected && (
          <div className="sunset-field relative mb-7 overflow-hidden rounded-2xl px-6 py-7 text-center text-white shadow-[0_16px_36px_rgba(255,31,138,0.28)]">
            <div className="grain" />
            <div className="relative flex flex-col items-center">
              <div className="target-stamp animate-float h-16 w-16" />
              <div className="font-display mt-4 text-xl uppercase tracking-wide">
                Complete!
              </div>
              <div className="mt-1 text-sm font-light text-white/90">
                全スタンプをコンプリートしました 🎉
              </div>
            </div>
          </div>
        )}

        {/* section label */}
        <div className="mb-5 flex items-baseline gap-3.5">
          <span className="font-mono text-[13px] text-[var(--color-brand)]">01</span>
          <span className="text-[15px] font-medium tracking-[0.06em] text-[var(--ink)]">
            スタンプ
          </span>
          <span className="overline text-[11px]">Stamp Card</span>
          <span className="h-px flex-1 border-t border-dashed border-[var(--hairline)]" />
        </div>

        {/* grid */}
        <div className="grid grid-cols-3 gap-3">
          {checkpoints.map((cp, i) => {
            const collected = ready ? hasStamp(cp.id) : false;
            return (
              <button
                key={cp.id}
                type="button"
                disabled={collected}
                onClick={() => setSelected(cp)}
                className="w-full text-left transition-transform active:scale-95 disabled:cursor-default"
              >
                <StampCard
                  checkpoint={cp}
                  collected={collected}
                  collectedAt={stamps.find(s => s.checkpointId === cp.id)?.collectedAt}
                  index={i}
                />
              </button>
            );
          })}
        </div>

        {ready && stamps.length > 0 && (
          <div className="mt-7 text-center">
            <button
              onClick={clearAll}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-2)] underline underline-offset-4 hover:text-[var(--muted)]"
            >
              Reset stamps (demo)
            </button>
          </div>
        )}
      </main>

      {/* ── MAP BUTTON ── */}
      {checkpoints.some(cp => cp.conditions.some(c => c.type === 'gps')) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[var(--paper)] via-[var(--paper)] to-transparent px-6 pb-6 pt-8">
          <div className="mx-auto max-w-lg">
            <button
              onClick={() => router.push('/map')}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--surface-2)] py-3 text-sm font-medium text-[var(--ink)] shadow-sm transition-all hover:bg-[var(--surface)] active:scale-95"
            >
              <MdMap size={18} className="text-[var(--color-brand)]" />
              マップで確認する
            </button>
          </div>
        </div>
      )}

      {/* ── DETAIL SHEET ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(20,19,42,0.5)] backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-[28px] bg-[var(--surface)] p-7"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-[var(--hairline)]" />
            <div className="mb-6 text-center">
              <p className="overline text-[11px] mb-2">Check in</p>
              <h2 className="font-display text-2xl uppercase leading-none text-[var(--ink)]">
                {selected.title}
              </h2>

              <div className="mt-5 space-y-2 text-left">
                {selected.conditions.map((c, i) => (
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
                    {selected.conditions.length > 1 && (
                      <span className="ml-auto font-mono text-[11px] text-[var(--muted-2)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {selected.conditions.length > 1 && (
                <p className="mt-3 text-xs font-light text-[var(--muted-2)]">
                  すべての条件を満たすとスタンプ獲得
                </p>
              )}
            </div>

            <button
              onClick={handleConfirm}
              className="sunset-cta mb-3 h-[54px] w-full text-base transition-transform active:scale-95"
            >
              開く ／ Open
            </button>
            <button
              onClick={() => setSelected(null)}
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

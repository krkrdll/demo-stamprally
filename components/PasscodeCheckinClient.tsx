'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useStamps } from '@/hooks/useStamps';
import { verifyPasscode } from '@/lib/actions/checkin';

type Props = {
  checkpointId: string;
  title: string;
  description?: string | null;
};

export default function PasscodeCheckinClient({ checkpointId, title, description }: Props) {
  const router = useRouter();
  const { hasStamp, addStamp } = useStamps();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [collected, setCollected] = useState(false);
  const [isPending, startTransition] = useTransition();

  const alreadyHas = hasStamp(checkpointId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const ok = await verifyPasscode(checkpointId, value);
      if (ok) {
        addStamp(checkpointId, title);
        setCollected(true);
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError('合言葉が違います。もう一度試してください。');
      }
    });
  }

  return (
    <div className="min-h-screen bg-purple-50">
      {collected && (
        <div className="fixed inset-0 theme-bg-mid flex items-center justify-center z-50">
          <div className="text-center text-white animate-bounce">
            <div className="text-8xl mb-4">🟠</div>
            <div className="text-3xl font-bold">スタンプゲット！</div>
          </div>
        </div>
      )}

      <header className="bg-purple-600 text-white px-4 py-4 flex items-center gap-3 shadow">
        <button
          onClick={() => router.back()}
          className="text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-purple-500 transition-colors"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">合言葉チェックイン</h1>
      </header>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <div className="text-5xl mb-3">🔑</div>
          <div className="font-bold text-gray-800 text-lg">{title}</div>
          {description && <div className="text-sm text-gray-400 mt-1">{description}</div>}
        </div>

        {alreadyHas ? (
          <div className="theme-bg-light border-2 theme-border rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">🟠</div>
            <div className="font-bold theme-text">取得済みです</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-1">
                合言葉を入力
              </label>
              <input
                id="passcode"
                type="text"
                value={value}
                onChange={e => { setValue(e.target.value); setError(null); }}
                placeholder="合言葉を入力してください"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                autoComplete="off"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={!value.trim() || isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? '確認中...' : 'チェックインする'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

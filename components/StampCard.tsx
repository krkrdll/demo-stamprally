import type { Checkpoint } from '@/lib/types';

type Props = {
  checkpoint: Checkpoint;
  collected: boolean;
  collectedAt?: string;
};

export default function StampCard({ checkpoint, collected, collectedAt }: Props) {
  return (
    <div
      className={`rounded-xl border-2 p-3 flex flex-col items-center text-center transition-all ${
        collected
          ? 'border-amber-400 bg-amber-50 shadow-md'
          : 'border-gray-200 bg-white'
      }`}
    >
      {collected ? (
        <div className="text-5xl mb-2">🟠</div>
      ) : checkpoint.type === 'marker' ? (
        <img
          src={checkpoint.markerImageUrl}
          alt={`${checkpoint.title}のQRコード`}
          className="w-16 h-16 mb-2 rounded border border-gray-100"
        />
      ) : checkpoint.type === 'passcode' ? (
        <div className="w-16 h-16 mb-2 rounded-full border-4 border-dashed border-purple-200 flex items-center justify-center text-purple-300 text-2xl">
          🔑
        </div>
      ) : (
        <div className="w-16 h-16 mb-2 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-2xl">
          ○
        </div>
      )}

      <div className="text-xs font-semibold text-gray-800 leading-tight">
        {checkpoint.title}
      </div>

      <div className="text-xs text-gray-400 mt-1">
        {checkpoint.type === 'gps' ? '📡 GPS' : checkpoint.type === 'passcode' ? '🔑 合言葉' : '📷 カメラ'}
      </div>

      {collected && collectedAt && (
        <div className="text-xs text-amber-600 mt-1">
          {new Date(collectedAt).toLocaleDateString('ja-JP')}
        </div>
      )}
    </div>
  );
}

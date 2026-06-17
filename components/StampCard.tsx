import type { Checkpoint } from '@/lib/types';

type Props = {
  checkpoint: Checkpoint;
  collected: boolean;
  collectedAt?: string;
};

const CONDITION_ICON: Record<string, string> = { gps: '📡', marker: '📷', passcode: '🔑' };

export default function StampCard({ checkpoint, collected, collectedAt }: Props) {
  const markerCondition = checkpoint.conditions.find(c => c.type === 'marker');
  const conditionTypes = checkpoint.conditions.map(c => c.type);

  return (
    <div
      className={`rounded-xl border-2 p-3 flex flex-col items-center text-center transition-all ${
        collected
          ? 'theme-border theme-bg-light shadow-md'
          : 'border-gray-200 bg-white'
      }`}
    >
      {collected ? (
        <div className="text-5xl mb-2">🟠</div>
      ) : markerCondition && markerCondition.type === 'marker' ? (
        <img
          src={markerCondition.markerImageUrl}
          alt={`${checkpoint.title}のQRコード`}
          className="w-16 h-16 mb-2 rounded border border-gray-100"
        />
      ) : (
        <div className="w-16 h-16 mb-2 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center gap-0.5">
          {conditionTypes.slice(0, 2).map((t, i) => (
            <span key={i} className="text-lg leading-none">{CONDITION_ICON[t] ?? '❓'}</span>
          ))}
        </div>
      )}

      <div className="text-xs font-semibold text-gray-800 leading-tight">
        {checkpoint.title}
      </div>

      <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1 flex-wrap">
        {conditionTypes.map((t, i) => (
          <span key={i}>{CONDITION_ICON[t] ?? '❓'}</span>
        ))}
      </div>

      {collected && collectedAt && (
        <div className="text-xs theme-text mt-1">
          {new Date(collectedAt).toLocaleDateString('ja-JP')}
        </div>
      )}
    </div>
  );
}

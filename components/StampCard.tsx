import type { Checkpoint } from '@/lib/types';
import { MdGpsFixed, MdQrCodeScanner, MdKey, MdHelp, MdAdjust } from 'react-icons/md';

type Props = {
  checkpoint: Checkpoint;
  collected: boolean;
  collectedAt?: string;
};

const CONDITION_ICON: Record<string, React.ReactNode> = {
  gps: <MdGpsFixed />,
  marker: <MdQrCodeScanner />,
  passcode: <MdKey />,
};

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
        <MdAdjust size={48} className="mb-2 theme-text" />
      ) : markerCondition && markerCondition.type === 'marker' ? (
        <img
          src={markerCondition.markerImageUrl}
          alt={`${checkpoint.title}のQRコード`}
          className="w-16 h-16 mb-2 rounded border border-gray-100"
        />
      ) : (
        <div className="w-16 h-16 mb-2 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center gap-0.5 text-gray-300 text-xl">
          {conditionTypes.slice(0, 2).map((t, i) => (
            <span key={i}>{CONDITION_ICON[t] ?? <MdHelp />}</span>
          ))}
        </div>
      )}

      <div className="text-xs font-semibold text-gray-800 leading-tight">
        {checkpoint.title}
      </div>

      <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
        {conditionTypes.map((t, i) => (
          <span key={i} className="text-sm">{CONDITION_ICON[t] ?? <MdHelp />}</span>
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

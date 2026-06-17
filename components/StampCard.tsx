import type { Checkpoint } from '@/lib/types';
import { MdGpsFixed, MdQrCodeScanner, MdKey, MdHelp, MdAdjust, MdStarOutline } from 'react-icons/md';

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

export default function StampCard({ checkpoint, collected }: Props) {
  const conditionTypes = checkpoint.conditions.map(c => c.type);

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden aspect-square relative transition-all ${
        collected ? 'theme-border shadow-md' : 'border-gray-200'
      }`}
    >
      {/* Background */}
      {checkpoint.imageUrl ? (
        <img
          src={checkpoint.imageUrl}
          alt={checkpoint.title}
          className={`absolute inset-0 w-full h-full object-cover ${!collected ? 'opacity-30 grayscale' : ''}`}
        />
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center ${collected ? 'theme-bg-light' : 'bg-gray-500'}`}>
          {collected && <MdAdjust size={40} className="theme-text opacity-70" />}
        </div>
      )}

      {/* Collected badge */}
      {collected && (
        <div className="absolute top-0 right-0 bg-black/50 w-8 h-8 flex items-center justify-center rounded-bl-lg">
          <div className="rounded-full">
            <MdStarOutline size={20} className="text-white" />
          </div>
        </div>
      )}

      {/* Bottom info strip */}
      <div className={`absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/50`}>
        <div className={`text-sm font-semibold flex items-center leading-tight truncate text-white`}>
          <div>{checkpoint.title}</div>
          <div className={`flex items-center justify-end flex-1 gap-0.5 text-white/70`}>
            {conditionTypes.map((t, i) => (
              <span key={i}>{CONDITION_ICON[t] ?? <MdHelp />}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

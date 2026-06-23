import type { Checkpoint } from '@/lib/types';
import { MdGpsFixed, MdQrCodeScanner, MdKey, MdHelp } from 'react-icons/md';

type Props = {
  checkpoint: Checkpoint;
  collected: boolean;
  collectedAt?: string;
  index?: number;
};

const CONDITION_ICON: Record<string, React.ReactNode> = {
  gps: <MdGpsFixed />,
  marker: <MdQrCodeScanner />,
  passcode: <MdKey />,
};

export default function StampCard({ checkpoint, collected, index }: Props) {
  const conditionTypes = checkpoint.conditions.map(c => c.type);
  const num = index != null ? String(index + 1).padStart(2, '0') : '';

  return (
    <div
      className={`relative flex aspect-square flex-col items-center justify-center gap-2 rounded-md border bg-[var(--surface-2)] p-3 text-center transition-all ${
        collected
          ? 'border-[var(--hairline)] shadow-[0_1px_2px_rgba(20,19,42,0.05)]'
          : 'border-dashed border-[var(--hairline)]'
      }`}
    >
      {/* Stamp slot */}
      {collected ? (
        <div className="target-stamp h-[58%] w-[58%] max-h-20 max-w-20" />
      ) : (
        <div className="flex h-[58%] w-[58%] max-h-20 max-w-20 items-center justify-center rounded-full border-2 border-dashed border-[rgba(20,19,42,0.24)]">
          <span className="font-display text-2xl text-[rgba(20,19,42,0.24)]">
            {num}
          </span>
        </div>
      )}

      {/* Spot name */}
      <div className="flex w-full items-center justify-center gap-1">
        <span
          className={`truncate text-[11px] font-medium leading-tight ${
            collected ? 'text-[var(--ink-soft)]' : 'text-[var(--muted)]'
          }`}
        >
          {checkpoint.title}
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-[var(--muted-2)]">
          {conditionTypes.map((t, i) => (
            <span key={i} className="text-[11px]">
              {CONDITION_ICON[t] ?? <MdHelp />}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

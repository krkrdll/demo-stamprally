'use client';

import { useTransition } from 'react';
import { moveCheckpoint } from '@/lib/actions/checkpoints';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';

type Props = {
  id: string;
  isFirst: boolean;
  isLast: boolean;
};

export default function ReorderButtons({ id, isFirst, isLast }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-0.5">
      <button
        disabled={isFirst || pending}
        onClick={() => startTransition(() => moveCheckpoint(id, 'up'))}
        className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        title="上へ"
      >
        <MdArrowUpward size={14} />
      </button>
      <button
        disabled={isLast || pending}
        onClick={() => startTransition(() => moveCheckpoint(id, 'down'))}
        className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        title="下へ"
      >
        <MdArrowDownward size={14} />
      </button>
    </div>
  );
}

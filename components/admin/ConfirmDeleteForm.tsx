'use client';

import { deleteCheckpoint } from '@/lib/actions/checkpoints';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmDeleteForm({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm('このチェックポイントを削除しますか？')) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const formData = new FormData();
    formData.set('id', id);
    startTransition(async () => {
      await deleteCheckpoint(formData);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={isPending}
        className="text-sm text-red-500 hover:text-red-700 hover:underline disabled:opacity-50 transition-colors"
      >
        {isPending ? '削除中...' : '削除'}
      </button>
    </form>
  );
}

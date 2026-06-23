import Link from 'next/link';
import CheckpointForm from '@/components/admin/CheckpointForm';
import { createCheckpoint } from '@/lib/actions/checkpoints';
import { MdArrowBack } from 'react-icons/md';

export default function NewCheckpointPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
          <MdArrowBack size={16} />一覧に戻る
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-800">新規チェックポイント</h1>
      </div>

      <CheckpointForm action={createCheckpoint} />
    </div>
  );
}

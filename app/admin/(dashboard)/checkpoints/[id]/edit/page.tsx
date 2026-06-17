import Link from 'next/link';
import { notFound } from 'next/navigation';
import CheckpointForm from '@/components/admin/CheckpointForm';
import { updateCheckpoint } from '@/lib/actions/checkpoints';
import { getCheckpointById } from '@/lib/checkpoints';
import { MdArrowBack } from 'react-icons/md';

export default async function EditCheckpointPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const checkpoint = await getCheckpointById(id);
  if (!checkpoint) notFound();

  const action = updateCheckpoint.bind(null, id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
          <MdArrowBack size={16} />一覧に戻る
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-800">チェックポイント編集</h1>
      </div>

      <CheckpointForm
        action={action}
        defaultValues={{
          title: checkpoint.title,
          description: checkpoint.description,
          conditions: checkpoint.conditions,
        }}
        isEditing
        checkpointId={checkpoint.id}
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import prisma from '@/lib/prisma';
import ConfirmDeleteForm from '@/components/admin/ConfirmDeleteForm';
import ReorderButtons from '@/components/admin/ReorderButtons';
import MarkerImagePreview from '@/components/admin/MarkerImagePreview';
import { MdGpsFixed, MdQrCodeScanner, MdKey, MdInbox, MdAdd } from 'react-icons/md';

const CONDITION_ICON: Record<string, React.ReactNode> = {
  gps: <MdGpsFixed />,
  marker: <MdQrCodeScanner />,
  passcode: <MdKey />,
};

const CONDITION_NAME: Record<string, string> = {
  gps: 'GPS',
  marker: 'マーカー',
  passcode: '合言葉',
};

const CONDITION_COLOR: Record<string, string> = {
  gps: 'bg-blue-100 text-blue-700',
  marker: 'bg-green-100 text-green-700',
  passcode: 'bg-purple-100 text-purple-700',
};

export default async function AdminPage() {
  const checkpoints = await prisma.checkpoint.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: { conditions: { orderBy: { sortOrder: 'asc' } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">チェックポイント管理</h1>
          <p className="text-sm text-gray-400 mt-0.5">{checkpoints.length} 件</p>
        </div>
        <Link
          href="/admin/checkpoints/new"
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
        >
          <MdAdd size={16} />新規追加
        </Link>
      </div>

      {checkpoints.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <MdInbox size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">チェックポイントがありません</p>
          <Link href="/admin/checkpoints/new" className="text-amber-600 hover:underline text-sm mt-2 inline-block">
            最初のチェックポイントを追加する
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-500">順序</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">条件</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">タイトル</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 hidden md:table-cell">説明</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 hidden lg:table-cell">詳細情報</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {checkpoints.map((cp, i) => (
                <tr key={cp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-4">
                    <ReorderButtons id={cp.id} isFirst={i === 0} isLast={i === checkpoints.length - 1} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {cp.conditions.map(c => (
                        <span
                          key={c.id}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${CONDITION_COLOR[c.type] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {CONDITION_ICON[c.type]}
                          {CONDITION_NAME[c.type] ?? c.type}
                        </span>
                      ))}
                      {cp.conditions.length === 0 && (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">{cp.title}</td>
                  <td className="px-5 py-4 text-gray-400 hidden md:table-cell">
                    {cp.description ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs hidden lg:table-cell">
                    <div className="space-y-1">
                      {cp.conditions.map(c => (
                        <div key={c.id}>
                          {c.type === 'gps' ? (
                            `${c.lat?.toFixed(4)}, ${c.lng?.toFixed(4)}`
                          ) : c.type === 'passcode' ? (
                            c.passcode
                          ) : (
                            <MarkerImagePreview
                              url={c.markerImageUrl ?? `/api/qr/${cp.id}`}
                              filename={`qr-${cp.id}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/checkpoints/${cp.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        編集
                      </Link>
                      <ConfirmDeleteForm id={cp.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

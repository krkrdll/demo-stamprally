export const dynamic = 'force-dynamic';

import Link from 'next/link';
import prisma from '@/lib/prisma';
import ConfirmDeleteForm from '@/components/admin/ConfirmDeleteForm';
import ReorderButtons from '@/components/admin/ReorderButtons';
import MarkerImagePreview from '@/components/admin/MarkerImagePreview';

export default async function AdminPage() {
  const checkpoints = await prisma.checkpoint.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">チェックポイント管理</h1>
          <p className="text-sm text-gray-400 mt-0.5">{checkpoints.length} 件</p>
        </div>
        <Link
          href="/admin/checkpoints/new"
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + 新規追加
        </Link>
      </div>

      {checkpoints.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">📋</div>
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
                <th className="px-5 py-3 text-left font-medium text-gray-500">種別</th>
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
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        cp.type === 'gps'
                          ? 'bg-blue-100 text-blue-700'
                          : cp.type === 'passcode'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {cp.type === 'gps' ? '📡 GPS' : cp.type === 'passcode' ? '🔑 合言葉' : '📷 マーカー'}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">{cp.title}</td>
                  <td className="px-5 py-4 text-gray-400 hidden md:table-cell">
                    {cp.description ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs hidden lg:table-cell">
                    {cp.type === 'gps' ? (
                      `${cp.lat?.toFixed(4)}, ${cp.lng?.toFixed(4)}`
                    ) : cp.type === 'passcode' ? (
                      cp.passcode
                    ) : (
                      <MarkerImagePreview
                        url={cp.markerImageUrl ?? `/api/qr/${cp.id}`}
                        filename={`qr-${cp.id}`}
                      />
                    )}
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

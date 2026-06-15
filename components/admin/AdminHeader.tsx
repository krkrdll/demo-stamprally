import Link from 'next/link';
import { logout } from '@/lib/actions/auth';

export default function AdminHeader() {
  return (
    <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-6">
        <span className="font-bold text-base">🛠️ 管理画面</span>
        <Link
          href="/admin"
          className="text-gray-300 hover:text-white text-sm transition-colors"
        >
          チェックポイント一覧
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          サイトを見る ↗
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            ログアウト
          </button>
        </form>
      </div>
    </header>
  );
}

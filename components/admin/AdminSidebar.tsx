import Link from 'next/link';
import { logout } from '@/lib/actions/auth';
import { MdBuild, MdListAlt, MdSettings, MdOpenInNew } from 'react-icons/md';

export default function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800 flex items-center gap-2">
        <MdBuild size={18} />
        <span className="font-bold text-base">管理画面</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <Link
          href="/admin"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors"
        >
          <MdListAlt size={16} />
          チェックポイント一覧
        </Link>
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors"
        >
          <MdSettings size={16} />
          サイト設定
        </Link>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 text-sm transition-colors"
        >
          サイトを見る
          <MdOpenInNew size={14} className="ml-auto" />
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 text-sm transition-colors text-left"
          >
            ログアウト
          </button>
        </form>
      </div>
    </aside>
  );
}

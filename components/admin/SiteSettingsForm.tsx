'use client';

import { useActionState } from 'react';
import { updateSiteSettings } from '@/lib/actions/settings';
import { THEMES, type ThemeKey } from '@/lib/themes';

type Props = {
  currentTitle: string;
  currentTheme: ThemeKey;
};

export default function SiteSettingsForm({ currentTitle, currentTheme }: Props) {
  const [, action, pending] = useActionState(updateSiteSettings, null);

  return (
    <form action={action} className="space-y-8">
      {/* サイトタイトル */}
      <div>
        <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 mb-1.5">
          サイトタイトル
        </label>
        <input
          id="siteTitle"
          name="siteTitle"
          type="text"
          defaultValue={currentTitle}
          required
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-400">ブラウザのタブやヘッダーに表示されます</p>
      </div>

      {/* テーマカラー */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-3">テーマカラー</p>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
            const t = THEMES[key];
            return (
              <label key={key} className="cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value={key}
                  defaultChecked={key === currentTheme}
                  className="sr-only peer"
                />
                <div
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 border-transparent peer-checked:border-gray-700 transition-all"
                >
                  <span
                    className="w-10 h-10 rounded-full shadow-sm"
                    style={{ backgroundColor: t.main }}
                  />
                  <span className="text-xs text-gray-600 select-none">{t.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
      >
        {pending ? '保存中…' : '保存する'}
      </button>
    </form>
  );
}

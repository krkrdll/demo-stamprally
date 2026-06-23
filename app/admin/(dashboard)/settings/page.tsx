import { getSiteSettings } from '@/lib/settings';
import SiteSettingsForm from '@/components/admin/SiteSettingsForm';

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">サイト設定</h1>
        <p className="text-sm text-gray-400 mt-0.5">デザインや表示名を変更できます</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-lg">
        <SiteSettingsForm currentTitle={settings.siteTitle} currentTheme={settings.theme} />
      </div>
    </div>
  );
}

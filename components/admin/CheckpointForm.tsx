'use client';

import { useState } from 'react';

type DefaultValues = {
  type: 'gps' | 'marker';
  title: string;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  markerImageUrl?: string | null;
};

type Props = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: DefaultValues;
  isEditing?: boolean;
};

export default function CheckpointForm({ action, defaultValues, isEditing }: Props) {
  const [type, setType] = useState<'gps' | 'marker'>(defaultValues?.type ?? 'gps');

  return (
    <form action={action} className="bg-white rounded-2xl shadow-sm p-6 space-y-5 max-w-lg">
      <input type="hidden" name="type" value={type} />

      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">種別</label>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={isEditing}
            onClick={() => setType('gps')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm border-2 transition-all ${
              type === 'gps'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            📡 GPS
          </button>
          <button
            type="button"
            disabled={isEditing}
            onClick={() => setType('marker')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm border-2 transition-all ${
              type === 'marker'
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            📷 マーカー
          </button>
        </div>
        {isEditing && (
          <p className="text-xs text-gray-400 mt-1">種別は変更できません</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={defaultValues?.title}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          説明
        </label>
        <input
          id="description"
          name="description"
          type="text"
          defaultValue={defaultValues?.description ?? ''}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
      </div>

      {/* GPS fields */}
      {type === 'gps' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
              緯度 (lat) <span className="text-red-500">*</span>
            </label>
            <input
              id="lat"
              name="lat"
              type="number"
              step="any"
              required
              defaultValue={defaultValues?.lat ?? ''}
              placeholder="35.6762"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-mono"
            />
          </div>
          <div>
            <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-1">
              経度 (lng) <span className="text-red-500">*</span>
            </label>
            <input
              id="lng"
              name="lng"
              type="number"
              step="any"
              required
              defaultValue={defaultValues?.lng ?? ''}
              placeholder="139.6503"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-mono"
            />
          </div>
        </div>
      )}

      {/* Marker URL */}
      {type === 'marker' && (
        <div>
          <label htmlFor="markerImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            マーカー画像URL
          </label>
          <input
            id="markerImageUrl"
            name="markerImageUrl"
            type="text"
            defaultValue={defaultValues?.markerImageUrl ?? ''}
            placeholder="空欄の場合、自動でQRコードが設定されます"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            空欄にすると /api/qr/&#123;id&#125; のQRコードが自動設定されます
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          {isEditing ? '更新する' : '作成する'}
        </button>
        <a
          href="/admin"
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}

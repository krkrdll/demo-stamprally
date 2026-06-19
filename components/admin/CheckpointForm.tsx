'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import MarkerImagePreview from './MarkerImagePreview';
import type { CheckpointCondition } from '@/lib/types';
import { MdGpsFixed, MdQrCodeScanner, MdKey, MdMap, MdAdd, MdDelete, MdImage, MdClose } from 'react-icons/md';

const MapPickerModal = dynamic(() => import('./MapPickerModal'), { ssr: false });

type ConditionDraft =
  | { type: 'gps'; lat: string; lng: string; radiusMeters: number }
  | { type: 'marker'; markerImageUrl: string }
  | { type: 'passcode'; passcode: string };

type Props = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    conditions: CheckpointCondition[];
  };
  isEditing?: boolean;
  checkpointId?: string;
};

function defaultDraft(): ConditionDraft {
  return { type: 'gps', lat: '', lng: '', radiusMeters: 20 };
}

function fromExisting(c: CheckpointCondition): ConditionDraft {
  if (c.type === 'gps') return { type: 'gps', lat: c.lat.toString(), lng: c.lng.toString(), radiusMeters: c.radiusMeters };
  if (c.type === 'passcode') return { type: 'passcode', passcode: c.passcode };
  return { type: 'marker', markerImageUrl: c.markerImageUrl };
}

export default function CheckpointForm({ action, defaultValues, isEditing, checkpointId }: Props) {
  const [conditions, setConditions] = useState<ConditionDraft[]>(
    defaultValues?.conditions?.length
      ? defaultValues.conditions.map(fromExisting)
      : [defaultDraft()]
  );
  const [mapPickerFor, setMapPickerFor] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.imageUrl ?? null);
  const [deleteImage, setDeleteImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateCondition(i: number, patch: Partial<ConditionDraft>) {
    setConditions(prev => prev.map((c, idx) => idx === i ? { ...c, ...patch } as ConditionDraft : c));
  }

  function changeType(i: number, type: ConditionDraft['type']) {
    if (type === 'gps') setConditions(prev => prev.map((c, idx) => idx === i ? { type: 'gps', lat: '', lng: '', radiusMeters: 20 } : c));
    else if (type === 'passcode') setConditions(prev => prev.map((c, idx) => idx === i ? { type: 'passcode', passcode: '' } : c));
    else setConditions(prev => prev.map((c, idx) => idx === i ? { type: 'marker', markerImageUrl: '' } : c));
  }

  function addCondition() {
    setConditions(prev => [...prev, defaultDraft()]);
  }

  function removeCondition(i: number) {
    setConditions(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleMapConfirm(newLat: number, newLng: number) {
    if (mapPickerFor !== null) {
      updateCondition(mapPickerFor, { lat: newLat.toFixed(6), lng: newLng.toFixed(6) } as Partial<ConditionDraft>);
    }
    setMapPickerFor(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setDeleteImage(false);
    }
  }

  function handleRemoveImage() {
    setImagePreview(null);
    setDeleteImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = conditions.map(c => {
      if (c.type === 'gps') return { type: 'gps', lat: parseFloat(c.lat), lng: parseFloat(c.lng), radiusMeters: c.radiusMeters };
      if (c.type === 'passcode') return { type: 'passcode', passcode: c.passcode };
      return { type: 'marker', markerImageUrl: c.markerImageUrl };
    });
    fd.set('conditions', JSON.stringify(payload));
    fd.set('deleteImage', deleteImage ? 'true' : 'false');
    if (defaultValues?.imageUrl) fd.set('existingImageUrl', defaultValues.imageUrl);
    e.preventDefault();
    action(fd);
  }

  const typeLabel: Record<string, React.ReactNode> = {
    gps: <><MdGpsFixed className="inline mr-1" />GPS</>,
    marker: <><MdQrCodeScanner className="inline mr-1" />マーカー</>,
    passcode: <><MdKey className="inline mr-1" />合言葉</>,
  };
  const typeColors: Record<string, string> = {
    gps: 'bg-blue-600 border-blue-600',
    marker: 'bg-green-600 border-green-600',
    passcode: 'bg-purple-600 border-purple-600',
  };
  const typeInactive: Record<string, string> = {
    gps: 'hover:border-blue-300',
    marker: 'hover:border-green-300',
    passcode: 'hover:border-purple-300',
  };

  return (
    <>
      {mapPickerFor !== null && (
        <MapPickerModal
          initialLat={conditions[mapPickerFor]?.type === 'gps' ? parseFloat((conditions[mapPickerFor] as {lat: string}).lat) || null : null}
          initialLng={conditions[mapPickerFor]?.type === 'gps' ? parseFloat((conditions[mapPickerFor] as {lng: string}).lng) || null : null}
          onConfirm={handleMapConfirm}
          onClose={() => setMapPickerFor(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5 max-w-lg">
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

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            チェックポイント画像
          </label>
          {/* Always keep the file input in the DOM so FormData includes it on submit */}
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageChange}
          />
          {imagePreview ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
              <img src={imagePreview} alt="プレビュー" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                title="画像を削除"
              >
                <MdClose size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <MdImage size={32} className="text-gray-300 mb-1" />
              <span className="text-xs text-gray-400">クリックして画像を選択</span>
              <span className="text-xs text-gray-300 mt-0.5">JPG / PNG / WebP</span>
            </div>
          )}
        </div>

        {/* Conditions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              チェックイン条件 <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-400">すべての条件を満たすとスタンプ獲得</span>
          </div>

          {conditions.map((cond, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  条件 {i + 1}
                </span>
                {conditions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCondition(i)}
                    className="flex items-center gap-0.5 text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    <MdDelete size={14} />削除
                  </button>
                )}
              </div>

              {/* Type selector */}
              <div className="flex gap-2">
                {(['gps', 'marker', 'passcode'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => changeType(i, t)}
                    className={`flex-1 py-2 rounded-lg font-medium text-xs border-2 transition-all ${
                      cond.type === t
                        ? `${typeColors[t]} text-white`
                        : `bg-white border-gray-200 text-gray-600 ${typeInactive[t]}`
                    }`}
                  >
                    {typeLabel[t]}
                  </button>
                ))}
              </div>

              {/* GPS fields */}
              {cond.type === 'gps' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        緯度 (lat) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={cond.lat}
                        onChange={e => updateCondition(i, { lat: e.target.value } as Partial<ConditionDraft>)}
                        placeholder="35.6762"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        経度 (lng) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={cond.lng}
                        onChange={e => updateCondition(i, { lng: e.target.value } as Partial<ConditionDraft>)}
                        placeholder="139.6503"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      チェックイン半径 (m) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={cond.radiusMeters}
                      onChange={e => updateCondition(i, { radiusMeters: Number(e.target.value) } as Partial<ConditionDraft>)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMapPickerFor(i)}
                    className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 rounded-lg text-xs font-medium transition-all"
                  >
                    <MdMap className="inline mr-1" />地図で位置を選択する
                  </button>
                </div>
              )}

              {/* Marker fields */}
              {cond.type === 'marker' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      マーカー画像URL
                    </label>
                    <input
                      type="text"
                      value={cond.markerImageUrl}
                      onChange={e => updateCondition(i, { markerImageUrl: e.target.value } as Partial<ConditionDraft>)}
                      placeholder="空欄の場合、自動でQRコードが設定されます"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      空欄にすると /api/qr/&#123;id&#125; のQRコードが自動設定されます
                    </p>
                  </div>
                  {(cond.markerImageUrl || checkpointId) && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <p className="text-xs text-gray-500 mb-2">プレビュー</p>
                      <MarkerImagePreview
                        url={cond.markerImageUrl || `/api/qr/${checkpointId}`}
                        filename={checkpointId ? `qr-${checkpointId}` : 'marker-image'}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Passcode fields */}
              {cond.type === 'passcode' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    合言葉 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cond.passcode}
                    onChange={e => updateCondition(i, { passcode: e.target.value } as Partial<ConditionDraft>)}
                    placeholder="例: さくら"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    参加者がこの合言葉を入力するとこの条件を達成できます
                  </p>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addCondition}
            className="w-full py-2.5 border-2 border-dashed border-amber-300 text-amber-600 hover:border-amber-400 hover:bg-amber-50 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1"
          >
            <MdAdd size={16} />条件を追加
          </button>
        </div>

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
    </>
  );
}

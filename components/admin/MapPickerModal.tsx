'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pickedIcon = L.divIcon({
  className: '',
  html: '<div style="width:24px;height:24px;background:#D97706;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type Props = {
  initialLat?: number | null;
  initialLng?: number | null;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
};

export default function MapPickerModal({ initialLat, initialLng, onConfirm, onClose }: Props) {
  const centerLat = initialLat ?? 35.6762;
  const centerLng = initialLng ?? 139.6503;
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">地図で位置を選択</h3>
            <p className="text-xs text-gray-500 mt-0.5">地図をタップして座標を設定します</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
          >
            ✕
          </button>
        </div>

        <div style={{ height: '380px', cursor: 'crosshair' }}>
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onPick={(lat, lng) => setPicked({ lat, lng })} />
            {picked && <Marker position={[picked.lat, picked.lng]} icon={pickedIcon} />}
          </MapContainer>
        </div>

        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 min-h-[36px] flex items-center">
          {picked ? (
            <p className="text-xs font-mono text-gray-600">
              緯度: {picked.lat.toFixed(6)} / 経度: {picked.lng.toFixed(6)}
            </p>
          ) : (
            <p className="text-xs text-gray-400">地図をタップして位置を選んでください</p>
          )}
        </div>

        <div className="px-4 py-3 flex gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={() => picked && onConfirm(picked.lat, picked.lng)}
            disabled={!picked}
            className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
          >
            この位置を設定する
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-lg text-sm transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}

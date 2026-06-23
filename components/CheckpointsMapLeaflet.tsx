'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type GpsPin = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  collected: boolean;
};

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(59,130,246,0.25)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const uncollectedIcon = L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;background:#D97706;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const collectedIcon = L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function AutoFit({
  pins,
  userLat,
  userLng,
}: {
  pins: GpsPin[];
  userLat: number | null;
  userLng: number | null;
}) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = pins.map(p => [p.lat, p.lng]);
    if (userLat !== null && userLng !== null) points.push([userLat, userLng]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 16);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 17 });
  }, [map, pins, userLat, userLng]);
  return null;
}

type Props = {
  pins: GpsPin[];
  userLat: number | null;
  userLng: number | null;
};

export default function CheckpointsMapLeaflet({ pins, userLat, userLng }: Props) {
  const center: [number, number] =
    pins.length > 0 ? [pins[0].lat, pins[0].lng] : [35.6812, 139.7671];

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map(pin => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={pin.collected ? collectedIcon : uncollectedIcon}
        >
          <Tooltip direction="top" offset={[0, -14]} permanent={false} opacity={0.95}>
            {pin.title}
          </Tooltip>
        </Marker>
      ))}
      {userLat !== null && userLng !== null && (
        <Marker position={[userLat, userLng]} icon={userIcon}>
          <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>現在地</Tooltip>
        </Marker>
      )}
      <AutoFit pins={pins} userLat={userLat} userLng={userLng} />
    </MapContainer>
  );
}

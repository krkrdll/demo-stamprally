'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// divIcon でデフォルトアイコンのパス問題を回避
const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(59,130,246,0.25)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const checkpointIcon = L.divIcon({
  className: '',
  html: '<div style="width:20px;height:20px;background:#D97706;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function AutoFit({
  userLat,
  userLng,
  cpLat,
  cpLng,
}: {
  userLat: number | null;
  userLng: number | null;
  cpLat: number;
  cpLng: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (userLat !== null && userLng !== null) {
      map.fitBounds(
        [[userLat, userLng], [cpLat, cpLng]],
        { padding: [50, 50], maxZoom: 18 }
      );
    } else {
      map.setView([cpLat, cpLng], 17);
    }
  }, [map, userLat, userLng, cpLat, cpLng]);
  return null;
}

type Props = {
  userLat: number | null;
  userLng: number | null;
  cpLat: number;
  cpLng: number;
  radiusMeters: number;
  inRange: boolean;
};

export default function MapView({ userLat, userLng, cpLat, cpLng, radiusMeters, inRange }: Props) {
  return (
    <MapContainer
      center={[cpLat, cpLng]}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: '260px', width: '100%', borderRadius: '12px', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[cpLat, cpLng]}
        radius={radiusMeters}
        pathOptions={{
          color: inRange ? '#22c55e' : '#f59e0b',
          fillColor: inRange ? '#22c55e' : '#f59e0b',
          fillOpacity: 0.18,
          weight: 2,
        }}
      />
      <Marker position={[cpLat, cpLng]} icon={checkpointIcon}>
        <Tooltip permanent direction="top" offset={[0, -14]}>目的地</Tooltip>
      </Marker>
      {userLat !== null && userLng !== null && (
        <Marker position={[userLat, userLng]} icon={userIcon}>
          <Tooltip permanent direction="top" offset={[0, -10]}>現在地</Tooltip>
        </Marker>
      )}
      <AutoFit userLat={userLat} userLng={userLng} cpLat={cpLat} cpLng={cpLng} />
    </MapContainer>
  );
}

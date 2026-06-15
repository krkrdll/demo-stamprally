'use client';

import { useState, useEffect } from 'react';

export type GeoState = {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
};

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState(s => ({ ...s, error: 'このブラウザは位置情報に対応していません', loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      err => {
        let msg = '位置情報の取得に失敗しました';
        if (err.code === 1) msg = '位置情報の使用が拒否されました';
        if (err.code === 3) msg = '位置情報の取得がタイムアウトしました';
        setState(s => ({ ...s, error: msg, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return state;
}

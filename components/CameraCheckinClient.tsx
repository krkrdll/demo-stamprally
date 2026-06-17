'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStamps } from '@/hooks/useStamps';
import type { Checkpoint } from '@/lib/types';

type Props = {
  checkpoints: Checkpoint[];
};

export default function CameraCheckinClient({ checkpoints }: Props) {
  const router = useRouter();
  const { addStamp, hasStamp } = useStamps();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stoppedRef = useRef(false);
  const hasStampRef = useRef(hasStamp);
  hasStampRef.current = hasStamp;

  const [camError, setCamError] = useState<string | null>(null);
  const [foundTitle, setFoundTitle] = useState<string | null>(null);

  const handleFound = useCallback(
    (cp: Checkpoint) => {
      stoppedRef.current = true;
      cancelAnimationFrame(animRef.current);
      addStamp(cp.id, cp.title);
      setFoundTitle(cp.title);
      setTimeout(() => router.push('/'), 2500);
    },
    [addStamp, router]
  );

  useEffect(() => {
    let stream: MediaStream | null = null;
    let active = true;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const jsQR = (await import('jsqr')).default;

        function tick() {
          if (!active || stoppedRef.current) return;

          const v = videoRef.current;
          const c = canvasRef.current;
          if (!v || !c) {
            animRef.current = requestAnimationFrame(tick);
            return;
          }

          if (v.readyState >= v.HAVE_ENOUGH_DATA) {
            c.width = v.videoWidth;
            c.height = v.videoHeight;
            const ctx = c.getContext('2d');
            if (ctx) {
              ctx.drawImage(v, 0, 0);
              const imgData = ctx.getImageData(0, 0, c.width, c.height);
              const code = jsQR(imgData.data, imgData.width, imgData.height, {
                inversionAttempts: 'dontInvert',
              });
              if (code) {
                const cp = checkpoints.find(c => c.id === code.data);
                if (cp && !hasStampRef.current(cp.id)) {
                  handleFound(cp);
                  return;
                }
              }
            }
          }
          animRef.current = requestAnimationFrame(tick);
        }

        animRef.current = requestAnimationFrame(tick);
      } catch {
        if (active) {
          setCamError('カメラへのアクセスが拒否されました。ブラウザの設定で許可してください。');
        }
      }
    }

    start();

    return () => {
      active = false;
      cancelAnimationFrame(animRef.current);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [checkpoints, handleFound]);

  const uncollectedCheckpoints = checkpoints.filter(cp => !hasStamp(cp.id));

  if (foundTitle) {
    return (
      <div className="fixed inset-0 theme-bg-mid flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="text-8xl mb-4 animate-bounce">🟠</div>
          <div className="text-3xl font-bold">スタンプゲット！</div>
          <div className="text-xl mt-3 opacity-90">{foundTitle}</div>
        </div>
      </div>
    );
  }

  if (camError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📷</div>
          <div className="text-red-400 mb-6 leading-relaxed">{camError}</div>
          <button
            onClick={() => router.back()}
            className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-full"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      <video
        ref={videoRef}
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent px-4 pt-4 pb-8 flex items-center gap-3 z-10">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white text-xl hover:bg-black/60 transition-colors"
        >
          ←
        </button>
        <h1 className="text-white text-xl font-bold">カメラ チェックイン</h1>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="relative w-56 h-56">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 theme-border rounded-tl-sm" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 theme-border rounded-tr-sm" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 theme-border rounded-bl-sm" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 theme-border rounded-br-sm" />
          <div className="absolute left-2 right-2 h-0.5 theme-bg-mid opacity-80 scan-line" />
        </div>
        <div className="mt-5 bg-black/60 text-white/90 text-sm px-5 py-2 rounded-full">
          QRコードをスキャン中...
        </div>
      </div>

      {uncollectedCheckpoints.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent pt-8">
          <div className="px-4 pb-6">
            <div className="text-xs text-gray-300 text-center mb-3">
              🔧 デモ用QRコード（カメラで読み取ってテスト）
            </div>
            <div className="flex gap-4 justify-center">
              {uncollectedCheckpoints.map(cp => {
                const markerCond = cp.conditions.find(c => c.type === 'marker');
                const url = markerCond?.type === 'marker' ? markerCond.markerImageUrl : `/api/qr/${cp.id}`;
                return (
                  <div key={cp.id} className="flex flex-col items-center gap-1.5">
                    <div className="bg-white rounded-lg p-1.5 shadow-lg">
                      <img
                        src={url}
                        alt={`${cp.title} QRコード`}
                        className="w-24 h-24 block"
                      />
                    </div>
                    <div className="text-xs text-gray-300 max-w-[96px] text-center leading-tight">
                      {cp.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {uncollectedCheckpoints.length === 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-center">
          <div className="theme-text-mid font-semibold">全マーカースタンプを取得済みです 🎉</div>
        </div>
      )}
    </div>
  );
}

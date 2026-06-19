'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useStamps } from '@/hooks/useStamps';
import { useGeolocation } from '@/hooks/useGeolocation';
import { haversineDistance } from '@/lib/distance';
import { verifyPasscode } from '@/lib/actions/checkin';
import type { Checkpoint, CheckpointCondition, ConditionGps } from '@/lib/types';
import {
  MdGpsFixed, MdQrCodeScanner, MdKey, MdHelp,
  MdAdjust, MdCheckCircle, MdArrowBack, MdBuildCircle,
  MdStraighten,
} from 'react-icons/md';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
      地図を読み込み中...
    </div>
  ),
});

type Props = { checkpoint: Checkpoint };

// ---- GPS widget ----
function GpsWidget({
  condition,
  onVerify,
}: {
  condition: ConditionGps;
  onVerify: () => void;
}) {
  const { lat, lng, accuracy, error, loading } = useGeolocation();
  const [demoLat, setDemoLat] = useState<number | null>(null);
  const [demoLng, setDemoLng] = useState<number | null>(null);

  const usedLat = demoLat ?? lat;
  const usedLng = demoLng ?? lng;
  const dist =
    usedLat !== null && usedLng !== null
      ? haversineDistance(usedLat, usedLng, condition.lat, condition.lng)
      : null;
  const inRange = dist !== null && dist <= condition.radiusMeters;

  return (
    <div className="space-y-2">
      <MapView
        userLat={usedLat}
        userLng={usedLng}
        cpLat={condition.lat}
        cpLng={condition.lng}
        radiusMeters={condition.radiusMeters}
        inRange={inRange}
      />
      <div className="text-xs text-gray-500">
        {loading
          ? '位置情報を取得中...'
          : error
          ? <span className="text-red-500">{error}</span>
          : usedLat !== null
          ? dist !== null
            ? inRange
              ? <span className="text-green-600 font-semibold flex items-center gap-1"><MdCheckCircle size={16} />範囲内！（{Math.round(dist)}m）</span>
              : <span className="flex items-center gap-1"><MdStraighten size={16} />{Math.round(dist)}m 離れています（{condition.radiusMeters}m 以内で達成）</span>
            : '距離計算中...'
          : '位置情報を取得中...'}
      </div>
      {inRange && (
        <button
          onClick={onVerify}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
        >
          <MdGpsFixed size={18} />現在地を確認する
        </button>
      )}
      {!inRange && (
        <button
          onClick={() => { setDemoLat(condition.lat); setDemoLng(condition.lng); }}
          className="w-full bg-gray-50 hover:bg-gray-100 text-gray-400 text-xs py-2 rounded-lg border border-dashed border-gray-200 transition-colors flex items-center justify-center gap-1"
        >
          <MdBuildCircle size={14} />デモ: この場所にいると仮定する
        </button>
      )}
      {demoLat !== null && (
        <button
          onClick={() => { setDemoLat(null); setDemoLng(null); }}
          className="w-full text-xs text-gray-400 underline underline-offset-2"
        >
          デモ位置をリセット
        </button>
      )}
    </div>
  );
}

// ---- Passcode widget ----
function PasscodeWidget({
  conditionId,
  onVerify,
}: {
  conditionId: string;
  onVerify: () => void;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const ok = await verifyPasscode(conditionId, value);
      if (ok) {
        onVerify();
      } else {
        setError('合言葉が違います。もう一度試してください。');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={value}
        onChange={e => { setValue(e.target.value); setError(null); }}
        placeholder="合言葉を入力してください"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
        autoComplete="off"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={!value.trim() || isPending}
        className="w-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50"
      >
        {isPending ? '確認中...' : <span className="flex items-center justify-center gap-2"><MdKey size={18} />合言葉を確認する</span>}
      </button>
    </form>
  );
}

// ---- Camera widget ----
function CameraWidget({
  checkpointId,
  onVerify,
}: {
  checkpointId: string;
  onVerify: () => void;
}) {
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stoppedRef = useRef(false);
  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  const stopCamera = useCallback(() => {
    stoppedRef.current = true;
    cancelAnimationFrame(animRef.current);
    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    if (!scanning) return;
    stoppedRef.current = false;
    let active = true;
    let stream: MediaStream | null = null;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const jsQR = (await import('jsqr')).default;

        function tick() {
          if (!active || stoppedRef.current) return;
          const v = videoRef.current;
          const c = canvasRef.current;
          if (!v || !c) { animRef.current = requestAnimationFrame(tick); return; }
          if (v.readyState >= v.HAVE_ENOUGH_DATA) {
            c.width = v.videoWidth; c.height = v.videoHeight;
            const ctx = c.getContext('2d');
            if (ctx) {
              ctx.drawImage(v, 0, 0);
              const img = ctx.getImageData(0, 0, c.width, c.height);
              const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
              if (code && code.data === checkpointId) {
                stoppedRef.current = true;
                cancelAnimationFrame(animRef.current);
                stream!.getTracks().forEach(t => t.stop());
                active = false;
                setScanning(false);
                onVerifyRef.current();
                return;
              }
            }
          }
          animRef.current = requestAnimationFrame(tick);
        }
        animRef.current = requestAnimationFrame(tick);
      } catch {
        if (active) setCamError('カメラへのアクセスが拒否されました。ブラウザの設定で許可してください。');
        setScanning(false);
      }
    }

    start();
    return () => {
      active = false;
      cancelAnimationFrame(animRef.current);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [scanning, checkpointId]);

  if (scanning) {
    return (
      <div className="fixed inset-0 z-40 bg-black">
        <canvas ref={canvasRef} className="hidden" />
        <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-48 h-48">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 theme-border rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 theme-border rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 theme-border rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 theme-border rounded-br-sm" />
          </div>
        </div>
        <div className="absolute bottom-16 inset-x-0 flex flex-col items-center gap-4">
          <p className="text-sm text-white/80">QRコードをスキャン中...</p>
          <button
            onClick={stopCamera}
            className="px-6 py-2 rounded-full bg-white/20 text-white text-sm backdrop-blur-sm"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {camError && <p className="text-red-500 text-xs">{camError}</p>}
      <button
        onClick={() => { setCamError(null); setScanning(true); }}
        className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
      >
        <MdQrCodeScanner size={18} />マーカーをスキャン
      </button>
    </div>
  );
}

const CONDITION_ICON: Record<string, React.ReactNode> = {
  gps: <MdGpsFixed />,
  marker: <MdQrCodeScanner />,
  passcode: <MdKey />,
};

const CONDITION_LABEL: Record<string, string> = {
  gps: '現在地確認',
  marker: 'マーカースキャン',
  passcode: '合言葉入力',
};

// ---- Main component ----
export default function MultiConditionCheckinClient({ checkpoint }: Props) {
  const router = useRouter();
  const { hasStamp, addStamp } = useStamps();
  const [currentStep, setCurrentStep] = useState(0);
  const [collected, setCollected] = useState(false);

  const alreadyHas = hasStamp(checkpoint.id);
  const total = checkpoint.conditions.length;
  const allVerified = currentStep >= total;

  function advanceStep() {
    setCurrentStep(prev => prev + 1);
  }

  function handleCollect() {
    addStamp(checkpoint.id, checkpoint.title);
    setCollected(true);
    setTimeout(() => router.push('/'), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {collected && (
        <div className="fixed inset-0 theme-bg-mid flex items-center justify-center z-50">
          <div className="text-center text-white animate-bounce">
            <MdAdjust size={96} className="mx-auto mb-4" />
            <div className="text-3xl font-bold">スタンプゲット！</div>
          </div>
        </div>
      )}

      <header className="relative z-50 theme-bg text-white px-4 py-4 flex items-center gap-3 shadow">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        >
          <MdArrowBack size={22} />
        </button>
        <h1 className="text-xl font-bold">チェックイン</h1>
        {total > 1 && !alreadyHas && (
          <span className="ml-auto text-sm font-medium opacity-80">
            {Math.min(currentStep, total)} / {total}
          </span>
        )}
      </header>

      <div className="p-4 max-w-lg mx-auto space-y-3">
        {/* Checkpoint title card */}
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="font-bold text-gray-800 text-lg">{checkpoint.title}</div>
          {checkpoint.description && (
            <div className="text-sm text-gray-400 mt-1">{checkpoint.description}</div>
          )}
          {total > 1 && !alreadyHas && !allVerified && (
            <div className="text-xs text-gray-400 mt-2 bg-gray-50 rounded-lg px-3 py-1.5 inline-block">
              すべての条件を順番に満たすとスタンプ獲得
            </div>
          )}
        </div>

        {alreadyHas ? (
          <div className="theme-bg-light border-2 theme-border rounded-xl p-4 text-center">
            <MdAdjust size={32} className="mx-auto mb-1 theme-text" />
            <div className="font-bold theme-text">取得済みです</div>
          </div>
        ) : (
          <>
            {checkpoint.conditions.map((cond: CheckpointCondition, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              if (!isDone && !isActive) return null;

              if (isDone) {
                return (
                  <div
                    key={cond.id}
                    className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3"
                  >
                    {total > 1 && (
                      <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                    )}
                    <span className="text-sm font-medium text-green-700">
                      {CONDITION_LABEL[cond.type] ?? cond.type}
                    </span>
                    <MdCheckCircle size={20} className="ml-auto text-green-500" />
                  </div>
                );
              }

              return (
                <div key={cond.id} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    {total > 1 && (
                      <span className="w-5 h-5 rounded-full border-2 border-amber-400 text-amber-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                    )}
                    <span className="text-lg text-gray-500">{CONDITION_ICON[cond.type] ?? <MdHelp />}</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {CONDITION_LABEL[cond.type] ?? cond.type}
                    </span>
                  </div>

                  {cond.type === 'gps' && (
                    <GpsWidget condition={cond} onVerify={advanceStep} />
                  )}
                  {cond.type === 'passcode' && (
                    <PasscodeWidget conditionId={cond.id} onVerify={advanceStep} />
                  )}
                  {cond.type === 'marker' && (
                    <CameraWidget checkpointId={checkpoint.id} onVerify={advanceStep} />
                  )}
                </div>
              );
            })}

            {allVerified && (
              <button
                onClick={handleCollect}
                className="w-full theme-bg active:scale-95 text-white font-bold py-4 rounded-xl transition-all text-lg shadow-lg flex items-center justify-center gap-2"
              >
                <MdAdjust size={24} />スタンプをゲット！
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

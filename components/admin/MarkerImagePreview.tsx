'use client';

import { useState } from 'react';

type Props = {
  url: string;
  filename?: string;
};

export default function MarkerImagePreview({ url, filename = 'marker-image' }: Props) {
  const [imgError, setImgError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isRelative = url.startsWith('/');

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const ext = blob.type.includes('svg') ? 'svg' : blob.type.split('/')[1] ?? 'png';
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${filename}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Thumbnail */}
      <a href={url} target="_blank" rel="noopener noreferrer" className="block shrink-0">
        {imgError ? (
          <div className="w-12 h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-300 text-xs">
            ERR
          </div>
        ) : (
          <img
            src={url}
            alt="marker"
            className="w-12 h-12 rounded-lg border border-gray-200 object-contain bg-white hover:opacity-80 transition-opacity"
            onError={() => setImgError(true)}
          />
        )}
      </a>

      {/* Actions */}
      <div className="flex flex-col gap-1">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline leading-none"
        >
          開く
        </a>
        {(isRelative || !imgError) && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="text-xs text-green-600 hover:underline leading-none text-left disabled:opacity-50"
          >
            {downloading ? '…' : 'DL'}
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';

interface Props {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  isLive?: boolean;
}

export default function HlsPlayer({ src, poster, autoPlay, isLive }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    let hls: import('hls.js').default | null = null;

    (async () => {
      const Hls = (await import('hls.js')).default;
      if (Hls.isSupported() && videoRef.current) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = src;
      }
    })();

    return () => { hls?.destroy(); };
  }, [src]);

  return (
    <div className="relative bg-black rounded-[--radius-md] overflow-hidden">
      {isLive && (
        <span className="absolute top-3 left-3 z-10 bg-[--color-accent-red] text-white
                         text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </span>
      )}
      <video
        ref={videoRef}
        controls
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        className="w-full aspect-video"
        style={{ maxHeight: '70vh' }}
      />
    </div>
  );
}

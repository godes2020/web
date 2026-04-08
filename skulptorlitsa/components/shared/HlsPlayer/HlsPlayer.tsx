'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  isLive?: boolean;
}

const VOL_KEY   = 'player_volume';
const MUTED_KEY = 'player_muted';

function loadVolPrefs() {
  try {
    const rawVol   = localStorage.getItem(VOL_KEY);
    const rawMuted = localStorage.getItem(MUTED_KEY);
    const vol      = rawVol !== null ? parseFloat(rawVol) : 1;
    const muted    = rawMuted !== null ? rawMuted === 'true' : false; // default: unmuted
    return { vol: isNaN(vol) ? 1 : Math.min(1, Math.max(0, vol)), muted };
  } catch { return { vol: 1, muted: false }; }
}

function saveVolPrefs(vol: number, muted: boolean) {
  try {
    localStorage.setItem(VOL_KEY,   String(vol));
    localStorage.setItem(MUTED_KEY, String(muted));
  } catch {}
}

export default function HlsPlayer({ src, poster, isLive }: Props) {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying]       = useState(false);
  const [volume, setVolume]         = useState(1);
  const [muted, setMuted]           = useState(true);
  const [needClick, setNeedClick]   = useState(false); // autoplay completely blocked
  const [showUnmute, setShowUnmute] = useState(false); // muted but playing
  const [isPip, setIsPip]           = useState(false);
  const [isFs, setIsFs]             = useState(false);

  // ── Restore volume from localStorage on mount ────────────────────────────────
  useEffect(() => {
    const { vol } = loadVolPrefs();
    setVolume(vol > 0 ? vol : 1);
  }, []);

  // ── Load HLS ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: import('hls.js').default | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    let hlsReady  = false;
    let keepAlive: ReturnType<typeof setInterval> | null = null;

    const applyVolume = () => {
      const { vol, muted: wasMuted } = loadVolPrefs();
      const restoredVol = vol > 0 ? vol : 1;
      video.volume = restoredVol;
      setVolume(restoredVol);
      if (wasMuted) {
        video.muted = true; setMuted(true); setShowUnmute(false);
      } else {
        video.muted = false;
        if (!video.muted) { setMuted(false); setShowUnmute(false); }
        else               { setMuted(true);  setShowUnmute(true); }
      }
    };

    const startPlay = () => {
      if (destroyed || !video || !hlsReady) return;
      video.muted = true;
      video.play()
        .then(() => { if (!destroyed) { setNeedClick(false); applyVolume(); } })
        .catch(() => { /* keepAlive will retry */ });
    };

    // KeepAlive: every second — if paused and HLS is ready, try play again
    const startKeepAlive = () => {
      if (keepAlive) clearInterval(keepAlive);
      keepAlive = setInterval(() => {
        if (destroyed) { clearInterval(keepAlive!); return; }
        if (hlsReady && video.paused) {
          video.muted = true;
          video.play().catch(() => {});
        }
      }, 1000);
    };

    const load = async () => {
      if (destroyed) return;

      const Hls = (await import('hls.js')).default;

      if (Hls.isSupported() && videoRef.current) {
        hls?.destroy();
        hls = new Hls({
          enableWorker:            true,
          lowLatencyMode:          false,
          startPosition:           -1,
          initialLiveManifestSize: 1,
          liveBackBufferLength:    2,
          maxBufferLength:         4,
          maxMaxBufferLength:      8,
          liveSyncDurationCount:   2,
          liveMaxLatencyDurationCount: 4,
          startFragPrefetch:       true,
        });
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (destroyed) return;
          hlsReady = true;
          startPlay();
          startKeepAlive();
        });

        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal && !destroyed) {
            hlsReady = false;
            hls?.destroy(); hls = null;
            retryTimer = setTimeout(load, 3000);
          }
        });
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = src;
        hlsReady = true;
        videoRef.current.addEventListener('loadedmetadata', () => {
          startPlay(); startKeepAlive();
        }, { once: true });
      }
    };

    const onPlay  = () => { setPlaying(true); setNeedClick(false); };
    const onPause = () => setPlaying(false);
    video.addEventListener('play',  onPlay);
    video.addEventListener('pause', onPause);

    load();

    return () => {
      destroyed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (keepAlive)  clearInterval(keepAlive);
      hls?.destroy();
      video.removeEventListener('play',  onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [src]);

  // ── Prevent rewinding ────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onSeeking = () => {
      try {
        if (video.seekable.length > 0) {
          const liveEdge = video.seekable.end(video.seekable.length - 1);
          if (liveEdge - video.currentTime > 5) {
            video.currentTime = liveEdge;
          }
        }
      } catch {}
    };
    video.addEventListener('seeking', onSeeking);
    return () => video.removeEventListener('seeking', onSeeking);
  }, []);

  // ── Fullscreen detection ─────────────────────────────────────────────────────
  useEffect(() => {
    const onFsChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── PiP detection ────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnter = () => setIsPip(true);
    const onLeave = () => setIsPip(false);
    video.addEventListener('enterpictureinpicture', onEnter);
    video.addEventListener('leavepictureinpicture', onLeave);
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnter);
      video.removeEventListener('leavepictureinpicture', onLeave);
    };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = true; // ensure muted before manual play too
      video.play()
        .then(() => setNeedClick(false))
        .catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    setShowUnmute(false);
    saveVolPrefs(video.volume, video.muted);
  }, []);

  const unmute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const { vol } = loadVolPrefs();
    const finalVol = vol > 0 ? vol : 1;
    video.muted  = false;
    video.volume = finalVol;
    setMuted(false);
    setVolume(finalVol);
    setShowUnmute(false);
    saveVolPrefs(finalVol, false);
  }, []);

  const changeVolume = useCallback((v: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = v;
    video.muted  = v === 0;
    setVolume(v);
    setMuted(v === 0);
    setShowUnmute(false);
    saveVolPrefs(v, v === 0);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    document.fullscreenElement
      ? document.exitFullscreen().catch(() => {})
      : el.requestFullscreen().catch(() => {});
  }, []);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      document.pictureInPictureElement
        ? await document.exitPictureInPicture()
        : await video.requestPictureInPicture();
    } catch {}
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', background: '#000',
        borderRadius: 20, overflow: 'hidden',
        width: '100%', aspectRatio: '16 / 9',
      }}
    >
      {/* autoPlay + muted as HTML attributes — most reliable autoplay in Chrome */}
      <video
        ref={videoRef}
        poster={poster}
        autoPlay
        muted
        playsInline
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
      />


      {/* Click-to-play — autoplay полностью заблокирован браузером */}
      {needClick && (
        <button
          onClick={() => { setNeedClick(false); togglePlay(); }}
          style={{
            position: 'absolute', inset: 0, zIndex: 25,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', color: '#fff',
          }}
        >
          <PlayIcon size={64} />
          <span style={{ marginTop: 14, fontSize: 15, fontWeight: 600 }}>
            Нажмите для воспроизведения
          </span>
        </button>
      )}

      {/* Small "Enable sound" button — stream plays, just muted */}
      {showUnmute && !needClick && (
        <button
          onClick={unmute}
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 20,
            background: 'rgba(0,0,0,0.75)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8, cursor: 'pointer', color: '#fff',
            padding: '7px 14px',
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 13, fontWeight: 600,
          }}
        >
          <MuteIcon />
          Включить звук
        </button>
      )}

      {/* Controls bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 15,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.82))',
        padding: '44px 14px 10px',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <CtrlBtn onClick={togglePlay} title={playing ? 'Пауза' : 'Воспроизвести'}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </CtrlBtn>

        <CtrlBtn onClick={toggleMute} title={muted ? 'Включить звук' : 'Выключить звук'}>
          {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
        </CtrlBtn>
        <input
          type="range" min={0} max={1} step={0.05}
          value={volume}
          onChange={e => changeVolume(parseFloat(e.target.value))}
          style={{ width: 72, cursor: 'pointer', accentColor: '#33783e', flexShrink: 0 }}
        />

        <div style={{ flex: 1 }} />

        <CtrlBtn onClick={togglePip} title="Картинка в картинке">
          <PipIcon active={isPip} />
        </CtrlBtn>

        <CtrlBtn onClick={toggleFullscreen} title={isFs ? 'Выйти из полного экрана' : 'На весь экран'}>
          {isFs ? <ExitFsIcon /> : <FsIcon />}
        </CtrlBtn>
      </div>

      <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:.25}}`}</style>
    </div>
  );
}

function CtrlBtn({ onClick, title, children }: {
  onClick: () => void; title?: string; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} title={title} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: '#fff', padding: '4px 5px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: 0.9, flexShrink: 0,
    }}>
      {children}
    </button>
  );
}

function PlayIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
}
function PauseIcon() {
  return <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>;
}
function VolumeIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
function MuteIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
function FsIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}
function ExitFsIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 3 3 3 3 8" /><polyline points="21 8 21 3 16 3" />
      <polyline points="3 16 3 21 8 21" /><polyline points="16 21 21 21 21 16" />
    </svg>
  );
}
function PipIcon({ active }: { active: boolean }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <rect x="12" y="12" width="8" height="6" rx="1" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

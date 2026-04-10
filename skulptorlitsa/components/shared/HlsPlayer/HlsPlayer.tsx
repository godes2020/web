'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Navigator {
    getAutoplayPolicy?: (type: 'mediaelement' | 'audiocontext' | 'query') => 'allowed' | 'allowed-muted' | 'disallowed';
  }
}

interface Props {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  isLive?: boolean;
}

const VOL_KEY = 'player_volume';

function loadVol(): number {
  try {
    const raw = localStorage.getItem(VOL_KEY);
    const v   = raw !== null ? parseFloat(raw) : 1;
    return isNaN(v) ? 1 : Math.min(1, Math.max(0, v));
  } catch { return 1; }
}

function saveVol(vol: number) {
  try { localStorage.setItem(VOL_KEY, String(vol)); } catch {}
}

export default function HlsPlayer({ src, poster, isLive }: Props) {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying]       = useState(false);
  const [volume, setVolume]         = useState(1);
  const [muted, setMuted]           = useState(false);
  const [needClick, setNeedClick]   = useState(false);
  const [showUnmute, setShowUnmute] = useState(false);
  const [isPip, setIsPip]           = useState(false);
  const [isFs, setIsFs]             = useState(false);

  const volumeRef     = useRef(1);
  const userPausedRef = useRef(false);

  // ── Restore volume from localStorage on mount ─────────────────────────────
  useEffect(() => {
    const vol = loadVol();
    volumeRef.current = vol;
    setVolume(vol);
  }, []);

  // ── Load HLS ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: import('hls.js').default | null = null;
    let hlsRetryTimer:  ReturnType<typeof setTimeout>  | null = null;
    let playRetryTimer: ReturnType<typeof setTimeout>  | null = null;
    let keepAlive:      ReturnType<typeof setInterval> | null = null;
    let destroyed = false;

    // Chrome 116+: check once if unmuted autoplay is allowed (MEI накоплен)
    const canPlayUnmuted =
      typeof navigator.getAutoplayPolicy === 'function' &&
      navigator.getAutoplayPolicy('mediaelement') === 'allowed';

    const startPlay = () => {
      if (destroyed || !video) return;

      video.volume = volumeRef.current;
      video.muted  = !canPlayUnmuted;

      const tryPlay = () => {
        if (destroyed) return;
        video.play()
          .then(() => {
            if (destroyed) return;
            setNeedClick(false);
            if (canPlayUnmuted) {
              setMuted(false); setShowUnmute(false); setVolume(volumeRef.current);
            } else {
              setMuted(true); setShowUnmute(true);
            }
            // Resume playback after stream stalls — but never override user pause
            if (keepAlive) clearInterval(keepAlive);
            keepAlive = setInterval(() => {
              if (destroyed) { clearInterval(keepAlive!); return; }
              if (video.paused && !userPausedRef.current) video.play().catch(() => {});
            }, 5000);
          })
          .catch(() => {
            if (!destroyed) playRetryTimer = setTimeout(tryPlay, 1000);
          });
      };

      tryPlay();
    };

    const load = async () => {
      if (destroyed) return;

      const Hls = (await import('hls.js')).default;

      if (Hls.isSupported() && videoRef.current) {
        hls?.destroy();
        hls = new Hls({
          enableWorker:                true,
          lowLatencyMode:              false,
          startPosition:               -1,
          initialLiveManifestSize:     1,
          liveBackBufferLength:        2,
          maxBufferLength:             4,
          maxMaxBufferLength:          8,
          liveSyncDurationCount:       2,
          liveMaxLatencyDurationCount: 4,
          startFragPrefetch:           true,
        });
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (destroyed) return;
          startPlay();
        });

        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal && !destroyed) {
            hls?.destroy(); hls = null;
            hlsRetryTimer = setTimeout(load, 3000);
          }
        });
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = src;
        videoRef.current.addEventListener('loadedmetadata', () => {
          startPlay();
        }, { once: true });
      }
    };

    const onPlay  = () => { setPlaying(true);  setNeedClick(false); };
    const onPause = () => { setPlaying(false); };
    video.addEventListener('play',  onPlay);
    video.addEventListener('pause', onPause);

    load();

    return () => {
      destroyed = true;
      if (hlsRetryTimer)  clearTimeout(hlsRetryTimer);
      if (playRetryTimer) clearTimeout(playRetryTimer);
      if (keepAlive)      clearInterval(keepAlive);
      hls?.destroy();
      video.removeEventListener('play',  onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [src]);

  // ── Prevent rewinding ─────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onSeeking = () => {
      try {
        if (video.seekable.length > 0) {
          const liveEdge = video.seekable.end(video.seekable.length - 1);
          if (liveEdge - video.currentTime > 5) video.currentTime = liveEdge;
        }
      } catch {}
    };
    video.addEventListener('seeking', onSeeking);
    return () => video.removeEventListener('seeking', onSeeking);
  }, []);

  // ── Fullscreen detection ──────────────────────────────────────────────────
  useEffect(() => {
    const onFsChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── PiP detection ─────────────────────────────────────────────────────────
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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.muted = true;
      video.play()
        .then(() => {
          video.volume = volumeRef.current;
          video.muted  = false;
          setNeedClick(false);
          setMuted(false);
        })
        .catch(() => {});
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
    setShowUnmute(false);
  }, []);

  const unmute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    setShowUnmute(false);
  }, []);

  const changeVolume = useCallback((v: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume      = v;
    video.muted       = v === 0;
    volumeRef.current = v;
    setVolume(v);
    setMuted(v === 0);
    setShowUnmute(false);
    saveVol(v);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if ((video as any)?.webkitEnterFullscreen) {
      // iOS Safari fallback
      (video as any).webkitEnterFullscreen();
    }
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

      {/* Twitch-style centered unmute overlay */}
      {showUnmute && !needClick && (
        <button
          onClick={unmute}
          style={{
            position: 'absolute', inset: 0, zIndex: 20,
            background: 'transparent',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0,0,0,0.7)',
            border: '2px solid rgba(255,255,255,0.15)',
            borderRadius: 12, padding: '12px 22px',
            color: '#fff', fontSize: 15, fontWeight: 700,
            animation: 'unmuteAppear 0.2s ease',
            backdropFilter: 'blur(4px)',
          }}>
            <MuteIcon size={22} />
            Включить звук
          </span>
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
          value={muted ? 0 : volume}
          onChange={e => changeVolume(parseFloat(e.target.value))}
          style={{ width: 72, cursor: 'pointer', accentColor: '#33783e', flexShrink: 0 }}
        />

        <div style={{ flex: 1 }} />

        <CtrlBtn onClick={toggleFullscreen} title={isFs ? 'Выйти из полного экрана' : 'На весь экран'}>
          {isFs ? <ExitFsIcon /> : <FsIcon />}
        </CtrlBtn>
      </div>

      <style>{`
        @keyframes livePulse{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes unmuteAppear{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
      `}</style>
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
function MuteIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

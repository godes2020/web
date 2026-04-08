'use client';

import HlsPlayer from '@/components/shared/HlsPlayer/HlsPlayer';
import ChatBox from '@/components/shared/ChatBox/ChatBox';
import { useStream } from '@/hooks/useStream';

const HLS_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/hls/stream.m3u8`;

function IconTv() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: '#bf9244' }}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function LivePage() {
  const { online, startedAt, viewers } = useStream();

  return (
    <main className="py-8">
      <div className="container">

        {/* Заголовок */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          {online ? (
            <span className="bg-[#a3212a] text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse inline-block" />
              LIVE
            </span>
          ) : (
            <span className="bg-[#666] text-white text-xs font-bold px-2 py-1 rounded">ОФЛАЙН</span>
          )}

          <h1 className="text-2xl font-bold text-[#0b140c]">Прямая трансляция</h1>

          {/* Счётчик зрителей */}
          {online && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#f0e9d6', border: '1px solid #c5b99a',
              borderRadius: 20, padding: '3px 10px',
              fontSize: 13, fontWeight: 600, color: '#33783e',
            }}>
              <IconEye />
              {viewers} {viewers === 1 ? 'зритель' : viewers >= 2 && viewers <= 4 ? 'зрителя' : 'зрителей'}
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div>
            {online ? (
              <HlsPlayer src={HLS_URL} autoPlay />
            ) : (
              <div className="bg-[#fffaee] border-2 border-[#bf9244] rounded-[20px] p-16 text-center">
                <div className="flex justify-center mb-4">
                  <IconTv />
                </div>
                <h2 className="text-xl font-bold text-[#0b140c] mb-2">Трансляция не идёт</h2>
                <p className="text-[#666]">Следите за анонсами — мы сообщим о начале эфира</p>
                {startedAt && (
                  <p className="text-sm text-[#999] mt-3">
                    Последний эфир: {new Date(startedAt).toLocaleString('ru')}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="h-[500px] lg:h-auto">
            <ChatBox online={online} />
          </div>
        </div>

      </div>
    </main>
  );
}

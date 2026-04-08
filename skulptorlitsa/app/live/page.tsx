'use client';

import HlsPlayer from '@/components/shared/HlsPlayer/HlsPlayer';
import ChatBox from '@/components/shared/ChatBox/ChatBox';
import { useStream } from '@/hooks/useStream';

const HLS_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/hls/stream.m3u8`;

export default function LivePage() {
  const { online, startedAt } = useStream();

  return (
    <main className="py-8">
      <div className="container">
        <div className="mb-6 flex items-center gap-3">
          {online ? (
            <span className="bg-[#a3212a] text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="bg-[#666] text-white text-xs font-bold px-2 py-1 rounded">ОФЛАЙН</span>
          )}
          <h1 className="text-2xl font-bold text-[#0b140c]">Прямая трансляция</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div>
            {online ? (
              <HlsPlayer src={HLS_URL} isLive autoPlay />
            ) : (
              <div className="bg-[#fffaee] border-2 border-[#bf9244] rounded-[20px] p-16 text-center">
                <div className="text-5xl mb-4">📺</div>
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

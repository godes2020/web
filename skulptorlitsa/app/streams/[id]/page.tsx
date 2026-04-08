'use client';

import { notFound } from 'next/navigation';
import { mockStreams } from '@/lib/mockData';
import HlsPlayer from '@/components/shared/HlsPlayer/HlsPlayer';
import ChatBox from '@/components/shared/ChatBox/ChatBox';
import CountdownTimer from '@/components/shared/CountdownTimer/CountdownTimer';

interface Props {
  params: { id: string };
}

export default function StreamPage({ params }: Props) {
  const stream = mockStreams.find(s => s.id === params.id);
  if (!stream) notFound();

  return (
    <main className="py-8">
      <div className="container">
        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {stream.status === 'live' && (
              <span className="bg-[#a3212a] text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />LIVE
              </span>
            )}
            {stream.status === 'upcoming' && (
              <span className="bg-[#bf9244] text-[#0b140c] text-xs font-bold px-2 py-1 rounded">СКОРО</span>
            )}
            {stream.status === 'ended' && (
              <span className="bg-[#666] text-white text-xs font-bold px-2 py-1 rounded">ЗАПИСЬ</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#0b140c] mb-2">{stream.title}</h1>
          <p className="text-[#666]">{stream.description}</p>
        </div>

        {/* Upcoming state */}
        {stream.status === 'upcoming' && (
          <div className="bg-[#fffaee] border-2 border-[#bf9244] rounded-[20px] p-10 text-center mb-8">
            <h2 className="text-xl font-bold mb-2">Эфир начнётся через</h2>
            <div className="flex justify-center mb-6">
              <CountdownTimer targetDate={new Date(stream.startAt)} />
            </div>
            <p className="text-[#666]">
              Дата: {new Date(stream.startAt).toLocaleString('ru', {
                day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        )}

        {/* Player + Chat */}
        {(stream.status === 'live' || stream.status === 'ended') && stream.hlsUrl && (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div>
              <HlsPlayer
                src={stream.hlsUrl}
                poster={stream.thumbnail}
                isLive={stream.status === 'live'}
                autoPlay={stream.status === 'live'}
              />
            </div>
            <div className="h-[500px] lg:h-auto">
              <ChatBox streamId={stream.id} />
            </div>
          </div>
        )}

        {/* Only chat if upcoming */}
        {stream.status === 'upcoming' && (
          <div className="max-w-md mx-auto">
            <h3 className="font-semibold mb-3">Чат трансляции</h3>
            <ChatBox streamId={stream.id} />
          </div>
        )}
      </div>
    </main>
  );
}

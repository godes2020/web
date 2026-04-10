'use client';

import { useEffect, useState } from 'react';

interface StreamStatus {
  online: boolean;
  startedAt: string | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export function useStream(isLivePage = false) {
  const [status, setStatus]   = useState<StreamStatus>({ online: false, startedAt: null });
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    let socket: import('socket.io-client').Socket | null = null;

    (async () => {
      const { io } = await import('socket.io-client');
      socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });

      socket.on('stream:status',  (data: StreamStatus)      => setStatus(data));
      socket.on('stream:viewers', (data: { count: number }) => setViewers(data.count));

      if (isLivePage) {
        socket.emit('viewer:join');
      }
    })();

    return () => {
      if (isLivePage) socket?.emit('viewer:leave');
      socket?.disconnect();
    };
  }, [isLivePage]);

  return { ...status, viewers };
}

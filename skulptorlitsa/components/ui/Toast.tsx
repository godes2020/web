'use client';

import { useState, useEffect, useCallback } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let addToast: ((msg: string, type?: ToastItem['type']) => void) | null = null;

export const toast = {
  success: (msg: string) => addToast?.(msg, 'success'),
  error: (msg: string) => addToast?.(msg, 'error'),
  info: (msg: string) => addToast?.(msg, 'info'),
};

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  let counter = 0;

  const add = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = ++counter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { addToast = add; return () => { addToast = null; }; }, [add]);

  const colors: Record<ToastItem['type'], string> = {
    success: 'bg-[#33783e] text-white',
    error:   'bg-[#c0392b] text-white',
    info:    'bg-[#444444] text-white',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`${colors[t.type]} px-5 py-3 rounded-[--radius-md] shadow-lg text-sm font-medium
                      animate-in slide-in-from-right duration-300 pointer-events-auto max-w-sm`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

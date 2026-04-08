'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

interface Message {
  id: string;
  author: string;
  text: string;
  time: string;
}

interface Props {
  streamId: string;
}

// Demo messages for UI preview (no real socket needed during dev)
const demoMessages: Message[] = [
  { id: '1', author: 'Людмила', text: 'Добрый день, Анна! Очень жду начала!', time: '10:01' },
  { id: '2', author: 'Тамара', text: 'Здравствуйте все! Готова заниматься 💚', time: '10:02' },
  { id: '3', author: 'Валентина', text: 'Уже третий эфир посещаю, результат есть!', time: '10:03' },
];

export default function ChatBox({ streamId }: Props) {
  const { user, isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim() || !isAuthenticated) return;
    const msg: Message = {
      id: Date.now().toString(),
      author: user?.name || 'Гость',
      text: input.trim(),
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[--radius-lg] shadow-[--shadow-card] overflow-hidden">
      <div className="p-4 border-b border-[--color-cream] bg-[--color-cream]/30">
        <h3 className="font-semibold text-[--color-text] text-base">Чат эфира</h3>
        <p className="text-xs text-[--color-text-muted]">{messages.length} сообщений</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.author === user?.name ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-[--color-primary] text-white flex items-center justify-center
                            text-xs font-bold flex-shrink-0">
              {m.author[0]}
            </div>
            <div className={`max-w-[80%] ${m.author === user?.name ? 'items-end' : ''} flex flex-col`}>
              <span className={`text-xs text-[--color-text-muted] mb-1 ${m.author === user?.name ? 'text-right' : ''}`}>
                {m.author} · {m.time}
              </span>
              <div className={`px-3 py-2 rounded-[--radius-sm] text-sm
                ${m.author === user?.name
                  ? 'bg-[--color-primary] text-white rounded-br-none'
                  : 'bg-[--color-cream] text-[--color-text] rounded-bl-none'}`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-[--color-cream]">
        {isAuthenticated ? (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Написать сообщение..."
              maxLength={300}
              className="flex-1 border border-[--color-cream] rounded-[--radius-sm] px-3 py-2
                         text-sm focus:outline-none focus:border-[--color-primary]
                         bg-[--color-milk] min-h-[44px]"
            />
            <button
              onClick={send}
              className="bg-[--color-primary] text-white px-4 py-2 rounded-[--radius-sm]
                         hover:bg-[--color-primary-mid] transition-colors text-sm font-medium min-h-[44px]"
            >
              →
            </button>
          </div>
        ) : (
          <p className="text-sm text-[--color-text-muted] text-center">
            <a href="/login" className="text-[--color-primary] font-medium">Войдите</a>, чтобы писать в чат
          </p>
        )}
      </div>
    </div>
  );
}

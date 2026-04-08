'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  name: string;
  text: string;
  time: string;
}

interface Props {
  online: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const NAME_KEY = 'chat_name';

export default function ChatBox({ online }: Props) {
  const [name, setName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<import('socket.io-client').Socket | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Восстановить имя из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) setName(saved);
  }, []);

  // Подключение к socket.io
  useEffect(() => {
    if (!name || !online) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    (async () => {
      const { io } = await import('socket.io-client');
      const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      const toMsg = (data: { name: string; text: string; time: string }): Message => ({
        id: `${data.time}-${Math.random()}`,
        name: data.name,
        text: data.text,
        time: new Date(data.time).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      });

      socket.on('chat:history', (history: { name: string; text: string; time: string }[]) => {
        setMessages(history.map(toMsg));
      });

      socket.on('chat:message', (data: { name: string; text: string; time: string }) => {
        setMessages(prev => [...prev, toMsg(data)]);
      });
    })();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [name, online]);

  // Автоскролл вниз — скроллим только сам контейнер, а не страницу
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem(NAME_KEY, trimmed);
    setName(trimmed);
    setNameInput('');
  };

  const send = (e?: React.KeyboardEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('chat:message', { name, text: input.trim() });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-black text-base">Чат эфира</h3>
        {name && <p className="text-xs text-gray-500">{messages.length} сообщений</p>}
      </div>

      {/* Ввод имени */}
      {!name && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <p className="text-sm text-gray-500 text-center">Введите имя для участия в чате</p>
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            placeholder="Ваше имя"
            maxLength={30}
            className="w-full border border-gray-300 rounded-lg px-3 py-2
                       text-sm text-black focus:outline-none focus:border-[#33783e] bg-white"
          />
          <button
            onClick={saveName}
            className="w-full bg-[#33783e] text-white px-4 py-2 rounded-lg
                       hover:bg-[#2a6234] transition-colors text-sm font-medium"
          >
            Войти в чат
          </button>
        </div>
      )}

      {/* Сообщения */}
      {name && (
        <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
          {messages.length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              {online ? 'Пока нет сообщений. Напишите первым!' : ''}
            </p>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex gap-2 ${m.name === name ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-[#33783e] text-white flex items-center justify-center
                              text-xs font-bold flex-shrink-0">
                {m.name[0]}
              </div>
              <div className={`max-w-[80%] ${m.name === name ? 'items-end' : ''} flex flex-col`}>
                <span className={`text-xs text-gray-500 mb-1 ${m.name === name ? 'text-right' : ''}`}>
                  {m.name} · {m.time}
                </span>
                <div className={`px-3 py-2 rounded-lg text-sm
                  ${m.name === name
                    ? 'bg-[#33783e] text-white rounded-br-none'
                    : 'bg-gray-100 text-black rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Инпут */}
      {name && (
        <div className="p-4 border-t border-gray-200">
          {online ? (
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(e); }}
                placeholder="Написать сообщение..."
                maxLength={300}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2
                           text-sm text-black focus:outline-none focus:border-[#33783e]
                           bg-white min-h-[44px]"
              />
              <button
                onClick={e => send(e)}
                className="bg-[#33783e] text-white px-4 py-2 rounded-lg
                           hover:bg-[#2a6234] transition-colors text-sm font-medium min-h-[44px]"
              >
                →
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              Чат недоступен — трансляция офлайн
            </p>
          )}
        </div>
      )}
    </div>
  );
}

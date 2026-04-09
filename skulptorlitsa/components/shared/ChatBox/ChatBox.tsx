'use client';

import { useState, useEffect, useRef } from 'react';

interface ReplyTo {
  name: string;
  text: string;
}

interface Message {
  id:      string;
  name:    string;
  text:    string;
  time:    string;
  replyTo: ReplyTo | null;
}

interface Props {
  online: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const NAME_KEY    = 'chat_name';

function IconReply() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function ChatBox({ online }: Props) {
  const [name, setName]           = useState('');
  const [nameInput, setNameInput] = useState('');
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [replyTo, setReplyTo]     = useState<ReplyTo | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const socketRef   = useRef<import('socket.io-client').Socket | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) setName(saved);
  }, []);

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

      const toMsg = (data: {
        name: string; text: string; time: string;
        replyTo?: ReplyTo | null;
      }): Message => ({
        id:      `${data.time}-${Math.random()}`,
        name:    data.name,
        text:    data.text,
        time:    new Date(data.time).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        replyTo: data.replyTo || null,
      });

      socket.on('chat:history', (history: any[]) => setMessages(history.map(toMsg)));
      socket.on('chat:message', (data: any)       => setMessages(prev => [...prev, toMsg(data)]));
    })();

    return () => { socketRef.current?.disconnect(); socketRef.current = null; };
  }, [name, online]);

  // Автоскролл
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

  const startReply = (msg: Message) => {
    setReplyTo({ name: msg.name, text: msg.text });
    inputRef.current?.focus();
  };

  const cancelReply = () => setReplyTo(null);

  const send = (e?: React.KeyboardEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('chat:message', { name, text: input.trim(), replyTo });
    setInput('');
    setReplyTo(null);
  };

  const isMine = (m: Message) => m.name === name;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">

      {/* Шапка */}
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
          <button onClick={saveName}
            className="w-full bg-[#33783e] text-white px-4 py-2 rounded-lg
                       hover:bg-[#2a6234] transition-colors text-sm font-medium">
            Войти в чат
          </button>
        </div>
      )}

      {/* Сообщения */}
      {name && (
        <div ref={messagesRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
          {messages.length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              {online ? 'Пока нет сообщений. Напишите первым!' : ''}
            </p>
          )}

          {messages.map(m => (
            <div
              key={m.id}
              className={`flex gap-2 group ${isMine(m) ? 'flex-row-reverse' : ''}`}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Аватар */}
              <div className="w-8 h-8 rounded-full bg-[#33783e] text-white flex items-center
                              justify-center text-xs font-bold flex-shrink-0 mt-5">
                {m.name[0]}
              </div>

              {/* Пузырь */}
              <div className={`max-w-[78%] flex flex-col ${isMine(m) ? 'items-end' : ''}`}>
                <span className={`text-xs text-gray-500 mb-1 ${isMine(m) ? 'text-right' : ''}`}>
                  {m.name} · {m.time}
                </span>

                <div className={`px-3 py-2 rounded-lg text-sm relative
                  ${isMine(m)
                    ? 'bg-[#33783e] text-white rounded-br-none'
                    : 'bg-gray-100 text-black rounded-bl-none'}`}>

                  {/* Цитата ответа */}
                  {m.replyTo && (
                    <div style={{
                      borderLeft: `3px solid ${isMine(m) ? 'rgba(255,255,255,0.5)' : '#33783e'}`,
                      paddingLeft: 8, marginBottom: 6,
                      opacity: 0.85,
                    }}>
                      <p style={{
                        fontSize: 11, fontWeight: 700, marginBottom: 2,
                        color: isMine(m) ? 'rgba(255,255,255,0.9)' : '#33783e',
                      }}>
                        {m.replyTo.name}
                      </p>
                      <p style={{
                        fontSize: 11,
                        color: isMine(m) ? 'rgba(255,255,255,0.75)' : '#555',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', maxWidth: 180,
                      }}>
                        {m.replyTo.text}
                      </p>
                    </div>
                  )}

                  {m.text}
                </div>
              </div>

              {/* Кнопка "Ответить" — появляется при наведении */}
              {online && (
                <button
                  onClick={() => startReply(m)}
                  style={{
                    alignSelf: 'center',
                    opacity: hoveredId === m.id ? 1 : 0,
                    transition: 'opacity 0.15s',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#888', padding: '4px 6px', borderRadius: 6,
                    display: 'flex', alignItems: 'center', gap: 3,
                    fontSize: 11, flexShrink: 0,
                  }}
                  title="Ответить"
                >
                  <IconReply />
                  Ответить
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Инпут */}
      {name && (
        <div className="border-t border-gray-200">

          {/* Превью ответа */}
          {replyTo && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px',
              background: '#f5f5f5',
              borderBottom: '1px solid #e5e5e5',
              gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{ width: 3, height: 32, background: '#33783e', borderRadius: 2, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#33783e', margin: 0 }}>
                    {replyTo.name}
                  </p>
                  <p style={{
                    fontSize: 11, color: '#666', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {replyTo.text}
                  </p>
                </div>
              </div>
              <button onClick={cancelReply} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#999', padding: 4, flexShrink: 0,
              }}>
                <IconClose />
              </button>
            </div>
          )}

          <div className="p-4">
            {online ? (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') send(e); }}
                  placeholder={replyTo ? `Ответить ${replyTo.name}...` : 'Написать сообщение...'}
                  maxLength={300}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2
                             text-sm text-black focus:outline-none focus:border-[#33783e]
                             bg-white min-h-[44px]"
                />
                <button onClick={e => send(e)}
                  className="bg-[#33783e] text-white px-4 py-2 rounded-lg
                             hover:bg-[#2a6234] transition-colors text-sm font-medium min-h-[44px]">
                  →
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                Чат недоступен — трансляция офлайн
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

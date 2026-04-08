'use client';

import { useState, useEffect } from 'react';

interface Props {
  targetDate: Date;
  onExpire?: () => void;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function CountdownTimer({ targetDate, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) { setExpired(true); onExpire?.(); return; }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate, onExpire]);

  if (expired) {
    return (
      <span style={{ color: '#33783e', fontWeight: 700, fontSize: 18 }}>
        Эфир начался!
      </span>
    );
  }

  const units = [
    { label: 'дн',  value: timeLeft.days },
    { label: 'ч',   value: timeLeft.hours },
    { label: 'мин', value: timeLeft.minutes },
    { label: 'сек', value: timeLeft.seconds },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1.5vw, 8px)' }}>
      {units.map(({ label, value }, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1.5vw, 8px)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: '#33783e',
              border: '2px solid #33783e',
              borderRadius: 10,
              minWidth: 'clamp(40px, 10vw, 58px)',
              padding: 'clamp(6px, 1.5vw, 10px) clamp(6px, 2vw, 12px)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(51,120,62,0.25)',
            }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: 'clamp(16px, 4.5vw, 28px)',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: 1,
                lineHeight: 1,
                display: 'block',
              }}>
                {pad(value)}
              </span>
            </div>
            <span style={{
              display: 'block',
              marginTop: 4,
              fontSize: 'clamp(9px, 2vw, 11px)',
              fontWeight: 600,
              color: '#33783e',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span style={{
              fontSize: 'clamp(16px, 4vw, 24px)',
              fontWeight: 800,
              color: '#33783e',
              marginBottom: 'clamp(14px, 3vw, 20px)',
              lineHeight: 1,
            }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}

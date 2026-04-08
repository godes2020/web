'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  const handleReset = async () => {
    if (password.length < 6) { toast.error('Пароль минимум 6 символов'); return; }
    if (password !== confirm) { toast.error('Пароли не совпадают'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      toast.success('Пароль успешно изменён!');
    } catch (e: any) {
      toast.error(e.message || 'Ошибка. Попробуйте запросить ссылку снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center py-12 px-4"
      style={{ background: 'linear-gradient(135deg, #e8f4ea 0%, #fffaee 100%)' }}>
      <div className="w-full max-w-md">
        <div style={{
          background: 'linear-gradient(160deg, #f5e4b8 0%, #ead4a1 50%, #e8c97a 100%)',
          borderRadius: 28, padding: '36px',
          boxShadow: '0 20px 60px rgba(191,146,68,0.25)',
          border: '1.5px solid rgba(191,146,68,0.5)',
        }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 72, height: 72, background: '#33783e', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2a1f00', marginBottom: 12 }}>Пароль изменён!</h2>
              <p style={{ color: '#7a6030', marginBottom: 24 }}>Теперь вы можете войти с новым паролем.</p>
              <Button href="/login" size="lg" className="!bg-[#33783e] !text-white">
                Войти
              </Button>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#2a1f00', marginBottom: 8, textAlign: 'center' }}>
                Новый пароль
              </h1>
              <p style={{ color: '#7a6030', fontSize: 14, textAlign: 'center', marginBottom: 28 }}>
                Введите новый пароль для вашего аккаунта
              </p>

              {[
                { label: 'Новый пароль', value: password, set: setPassword, placeholder: 'Минимум 6 символов' },
                { label: 'Подтвердите пароль', value: confirm, set: setConfirm, placeholder: 'Повторите пароль' },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5a4010', marginBottom: 6 }}>{label}</label>
                  <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    style={{
                      width: '100%', height: 52, padding: '0 16px', fontSize: 15,
                      border: '2px solid rgba(191,146,68,0.5)', borderRadius: 12,
                      background: 'rgba(191,146,68,0.2)', outline: 'none',
                      boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#33783e')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(191,146,68,0.5)')}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <input type="checkbox" id="sp" checked={show} onChange={e => setShow(e.target.checked)} style={{ accentColor: '#33783e' }} />
                <label htmlFor="sp" style={{ fontSize: 13, color: '#7a6030', cursor: 'pointer' }}>Показать пароли</label>
              </div>

              <Button onClick={handleReset} loading={loading} fullWidth size="lg" className="!bg-[#33783e] !text-white">
                Сохранить пароль
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}

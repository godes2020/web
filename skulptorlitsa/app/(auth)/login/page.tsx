'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Введите ваше имя'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

const VkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.579 6.855c.14-.465 0-.806-.666-.806h-2.199c-.56 0-.817.295-.957.621 0 0-1.12 2.72-2.706 4.488-.513.514-.746.677-1.025.677-.14 0-.344-.163-.344-.628V6.855c0-.559-.162-.806-.626-.806H11c-.348 0-.558.259-.558.505 0 .529.792.651.873 2.14v3.233c0 .708-.128.837-.406.837-.746 0-2.561-2.732-3.637-5.863-.211-.61-.423-.856-.986-.856H3.087c-.628 0-.754.295-.754.621 0 .582.746 3.463 3.471 7.279 1.816 2.605 4.373 4.018 6.701 4.018 1.397 0 1.569-.313 1.569-.853v-1.966c0-.628.133-.753.574-.753.326 0 .885.163 2.19 1.42 1.491 1.49 1.737 2.152 2.576 2.152h2.199c.628 0 .942-.313.761-.931-.198-.616-.912-1.51-1.858-2.57-.513-.606-1.282-1.258-1.515-1.585-.325-.419-.232-.605 0-.977 0 0 2.678-3.77 2.958-5.048z"/>
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function PasswordInput({ register: reg, name, placeholder, error }: {
  register: any; name: string; placeholder: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        {...reg(name)}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        style={{
          width: '100%', height: 52, padding: '0 48px 0 16px', fontSize: 15,
          border: '2px solid rgba(191,146,68,0.5)', borderRadius: 12,
          background: 'rgba(191,146,68,0.2)', outline: 'none',
          boxSizing: 'border-box', transition: 'border-color 0.2s', color: '#3a2e00',
        }}
        onFocus={e => (e.target.style.borderColor = '#33783e')}
        onBlur={e => (e.target.style.borderColor = 'rgba(191,146,68,0.5)')}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: '#7a6030', padding: 0,
        }}
      >
        <EyeIcon open={show} />
      </button>
      {error && <p style={{ color: '#a3212a', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 52, padding: '0 16px', fontSize: 15,
  border: '2px solid rgba(191,146,68,0.5)', borderRadius: 12,
  background: 'rgba(191,146,68,0.2)', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s', color: '#3a2e00',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#5a4010', marginBottom: 6,
};

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [visible, setVisible] = useState(false);
  const [formKey, setFormKey] = useState(0);
  // OTP step state
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pendingData, setPendingData] = useState<RegisterData | null>(null);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const switchMode = (next: 'login' | 'register') => {
    if (next === mode) return;
    setMode(next);
    setStep('form');
    setPendingData(null);
    setOtp('');
    setFormKey(k => k + 1);
    loginForm.reset();
    registerForm.reset();
  };

  const handleVkLogin = () => {
    const vkAppId = process.env.NEXT_PUBLIC_VK_APP_ID || '12345678';
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/vk/callback`);
    window.location.href = `https://oauth.vk.com/authorize?client_id=${vkAppId}&display=page&redirect_uri=${redirectUri}&scope=email&response_type=code&v=5.131`;
  };

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const onLogin = async (data: LoginData) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      login(json.jwt, json.user);
      localStorage.setItem('jwt', json.jwt);
      localStorage.setItem('user', JSON.stringify(json.user));
      toast.success('Добро пожаловать!');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.message || 'Неверный email или пароль');
    }
  };

  const onRegister = async (data: RegisterData) => {
    try {
      const res = await fetch(`${API}/auth/register/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPendingData(data);
      setStep('otp');
      setResendCooldown(60);
      toast.success('Код отправлен на ' + data.email);
    } catch (e: any) {
      toast.error(e.message || 'Ошибка регистрации');
    }
  };

  const onVerifyCode = async () => {
    if (!pendingData || otp.length !== 6) return;
    setOtpLoading(true);
    try {
      const res = await fetch(`${API}/auth/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pendingData.name,
          email: pendingData.email,
          password: pendingData.password,
          code: otp,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      login(json.jwt, json.user);
      localStorage.setItem('jwt', json.jwt);
      localStorage.setItem('user', JSON.stringify(json.user));
      toast.success('Аккаунт создан! Добро пожаловать!');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.message || 'Неверный код');
    } finally {
      setOtpLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!pendingData || resendCooldown > 0) return;
    try {
      const res = await fetch(`${API}/auth/register/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pendingData.name, email: pendingData.email, password: pendingData.password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResendCooldown(60);
      setOtp('');
      toast.success('Новый код отправлен');
    } catch (e: any) {
      toast.error(e.message || 'Ошибка');
    }
  };

  const onForgotPassword = async () => {
    const email = loginForm.getValues('email');
    if (!email) { toast.error('Введите email для сброса пароля'); return; }
    try {
      await fetch(`${API}/auth/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      toast.success('Письмо со сбросом пароля отправлено на ' + email);
    } catch {
      toast.error('Ошибка. Попробуйте позже.');
    }
  };

  const demoLogin = () => {
    const user = { id: 'demo-1', name: 'Людмила (демо)', email: 'demo@example.ru' };
    login('demo-jwt-token', user);
    localStorage.setItem('user', JSON.stringify(user));
    toast.success('Добро пожаловать!');
    router.push('/dashboard');
  };

  const isLogin = mode === 'login';

  return (
    <main
      className="min-h-[80vh] flex items-center justify-center py-12 px-4"
      style={{ background: 'linear-gradient(135deg, #e8f4ea 0%, #fffaee 50%, #f0ece0 100%)' }}
    >
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(51,120,62,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '8%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(191,146,68,0.1)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div
        className="w-full max-w-md relative"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div style={{
          background: 'linear-gradient(160deg, #f5e4b8 0%, #ead4a1 50%, #e8c97a 100%)',
          borderRadius: 28, padding: '36px 36px 28px',
          boxShadow: '0 20px 60px rgba(191,146,68,0.25), 0 4px 16px rgba(0,0,0,0.1)',
          border: '1.5px solid rgba(191,146,68,0.5)',
        }}>

          {/* Toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.1)', borderRadius: 99, padding: 4, marginBottom: 28, gap: 4 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{
                flex: 1, padding: '10px 0', borderRadius: 99, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 14,
                background: mode === m ? '#33783e' : 'transparent',
                color: mode === m ? '#fff' : '#7a6030',
                boxShadow: mode === m ? '0 2px 8px rgba(51,120,62,0.35)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              }}>
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2a1f00', margin: '0 0 6px' }}>
              {step === 'otp' ? 'Введите код' : isLogin ? 'Войти в кабинет' : 'Создать аккаунт'}
            </h1>
            <p style={{ color: '#7a6030', fontSize: 14, margin: 0 }}>
              {step === 'otp'
                ? <>Отправили 6-значный код на <strong>{pendingData?.email}</strong></>
                : isLogin ? 'Введите email и пароль' : 'Бесплатно — займёт минуту'}
            </p>
          </div>

          {/* OTP step */}
          {step === 'otp' && (
            <div style={{ animation: 'loginFadeIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
              {/* Code input */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (!val) {
                        setOtp(prev => prev.slice(0, i) + ' ' + prev.slice(i + 1));
                        return;
                      }
                      const next = otp.split('');
                      next[i] = val[val.length - 1];
                      const filled = next.join('').replace(/ /g, '');
                      setOtp(next.join(''));
                      if (filled.length <= 6) {
                        const nextEl = document.getElementById(`otp-${i + 1}`);
                        if (nextEl) (nextEl as HTMLInputElement).focus();
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !otp[i]) {
                        const prevEl = document.getElementById(`otp-${i - 1}`);
                        if (prevEl) (prevEl as HTMLInputElement).focus();
                      }
                    }}
                    onPaste={e => {
                      e.preventDefault();
                      const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      const arr = text.split('');
                      setOtp(arr.join('').padEnd(6, ' '));
                      const lastEl = document.getElementById(`otp-${Math.min(text.length, 5)}`);
                      if (lastEl) (lastEl as HTMLInputElement).focus();
                    }}
                    style={{
                      width: 48, height: 58, textAlign: 'center', fontSize: 24, fontWeight: 700,
                      border: `2px solid ${otp[i] && otp[i] !== ' ' ? '#33783e' : 'rgba(191,146,68,0.5)'}`,
                      borderRadius: 12, background: 'rgba(191,146,68,0.15)', outline: 'none',
                      color: '#2a1f00', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#33783e')}
                    onBlur={e => (e.target.style.borderColor = otp[i] && otp[i] !== ' ' ? '#33783e' : 'rgba(191,146,68,0.5)')}
                  />
                ))}
              </div>

              <button
                onClick={onVerifyCode}
                disabled={otpLoading || otp.replace(/ /g, '').length < 6}
                style={{
                  width: '100%', padding: '15px 0', borderRadius: 99, border: 'none',
                  background: otp.replace(/ /g, '').length === 6 ? '#33783e' : 'rgba(51,120,62,0.4)',
                  color: '#fff', fontWeight: 700, fontSize: 16, cursor: otp.replace(/ /g, '').length === 6 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s', marginBottom: 16,
                }}
              >
                {otpLoading ? 'Проверяем...' : 'Подтвердить'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={onResendCode}
                  disabled={resendCooldown > 0}
                  style={{
                    background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    color: resendCooldown > 0 ? '#aaa' : '#33783e', fontSize: 13, textDecoration: resendCooldown > 0 ? 'none' : 'underline',
                  }}
                >
                  {resendCooldown > 0 ? `Отправить повторно через ${resendCooldown} сек.` : 'Отправить код повторно'}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  onClick={() => { setStep('form'); setOtp(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6030', fontSize: 13, textDecoration: 'underline' }}
                >
                  ← Изменить данные
                </button>
              </div>
            </div>
          )}

          {/* Animated form area */}
          {step === 'form' && <div key={`${mode}-${formKey}`} style={{ animation: 'loginFadeIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>

            {/* VK */}
            <button onClick={handleVkLogin} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: '#0077FF', color: '#fff', fontWeight: 700, fontSize: 15,
              border: 'none', borderRadius: 99, padding: '14px 20px', cursor: 'pointer',
              marginBottom: 18, boxShadow: '0 4px 16px rgba(0,119,255,0.35)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0066DD'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0077FF'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <VkIcon />
              {isLogin ? 'Войти через ВКонтакте' : 'Зарегистрироваться через ВК'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.15)' }} />
              <span style={{ color: '#7a6030', fontSize: 13 }}>или с паролем</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.15)' }} />
            </div>

            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(onLogin)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    {...loginForm.register('email')}
                    type="email" placeholder="ваш@email.ru"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#33783e')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(191,146,68,0.5)')}
                  />
                  {loginForm.formState.errors.email && <p style={{ color: '#a3212a', fontSize: 12, marginTop: 4 }}>{loginForm.formState.errors.email.message}</p>}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Пароль</label>
                    <button type="button" onClick={onForgotPassword} style={{ fontSize: 12, color: '#33783e', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Забыли пароль?</button>
                  </div>
                  <PasswordInput register={loginForm.register} name="password" placeholder="••••••••" error={loginForm.formState.errors.password?.message} />
                </div>

                <Button type="submit" loading={loginForm.formState.isSubmitting} fullWidth size="lg" className="!bg-[#33783e] !text-white hover:!bg-[#2a6333]">
                  Войти
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegister)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Ваше имя</label>
                  <input
                    {...registerForm.register('name')}
                    type="text" placeholder="Анна"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#33783e')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(191,146,68,0.5)')}
                  />
                  {registerForm.formState.errors.name && <p style={{ color: '#a3212a', fontSize: 12, marginTop: 4 }}>{registerForm.formState.errors.name.message}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    {...registerForm.register('email')}
                    type="email" placeholder="ваш@email.ru"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#33783e')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(191,146,68,0.5)')}
                  />
                  {registerForm.formState.errors.email && <p style={{ color: '#a3212a', fontSize: 12, marginTop: 4 }}>{registerForm.formState.errors.email.message}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Пароль</label>
                  <PasswordInput register={registerForm.register} name="password" placeholder="Минимум 6 символов" error={registerForm.formState.errors.password?.message} />
                </div>

                <div>
                  <label style={labelStyle}>Повторите пароль</label>
                  <PasswordInput register={registerForm.register} name="confirmPassword" placeholder="Повторите пароль" error={registerForm.formState.errors.confirmPassword?.message} />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <input type="checkbox" id="cr" required style={{ marginTop: 3, width: 16, height: 16, accentColor: '#33783e', flexShrink: 0 }} />
                  <label htmlFor="cr" style={{ fontSize: 12, color: '#7a6030', lineHeight: 1.5 }}>
                    Согласна на обработку персональных данных согласно{' '}
                    <a href="/privacy" style={{ color: '#33783e' }} target="_blank">политике</a>
                  </label>
                </div>

                <Button type="submit" loading={registerForm.formState.isSubmitting} fullWidth size="lg" className="!bg-[#33783e] !text-white hover:!bg-[#2a6333]">
                  Зарегистрироваться
                </Button>
              </form>
            )}

            <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(0,0,0,0.12)', textAlign: 'center' }}>
              <p style={{ color: '#33783e', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Режим демонстрации</p>
              <button onClick={demoLogin} style={{ color: '#33783e', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Войти как демо-пользователь
              </button>
            </div>
          </div>}
        </div>
      </div>

      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

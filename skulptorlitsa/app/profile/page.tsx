'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function ProfilePage() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Смена пароля
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatar || null);
    }
  }, [user, isAuthenticated, router]);

  const getJwt = () => {
    if (typeof window !== 'undefined') return localStorage.getItem('jwt');
    return null;
  };

  const authHeaders = () => ({
    'Authorization': `Bearer ${getJwt()}`,
    'Content-Type': 'application/json',
  });

  const handleSaveName = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Имя минимум 2 символа'); return;
    }
    setSavingName(true);
    try {
      const res = await fetch(`${API}/me`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(getJwt()!, data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Имя сохранено');
    } catch (e: any) {
      toast.error(e.message || 'Ошибка сохранения');
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Файл слишком большой. Максимум 5 МБ'); return; }
    setAvatarPreview(URL.createObjectURL(file));
    handleUploadAvatar(file);
  };

  const handleUploadAvatar = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await fetch(`${API}/me/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getJwt()}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const fullUrl = `http://localhost:4000${data.user.avatar}`;
      setAvatarUrl(fullUrl);
      login(getJwt()!, { ...data.user, avatar: fullUrl });
      localStorage.setItem('user', JSON.stringify({ ...data.user, avatar: fullUrl }));
      toast.success('Аватар обновлён');
    } catch (e: any) {
      toast.error(e.message || 'Ошибка загрузки');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error('Новый пароль минимум 6 символов'); return; }
    if (newPassword !== confirmPassword) { toast.error('Пароли не совпадают'); return; }
    setSavingPassword(true);
    try {
      const res = await fetch(`${API}/me/password`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Пароль изменён');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e: any) {
      toast.error(e.message || 'Ошибка');
    } finally {
      setSavingPassword(false);
    }
  };

  const avatarDisplay = avatarPreview || avatarUrl;
  const initials = (name || user?.email || 'U')[0].toUpperCase();

  return (
    <main className="py-12 px-4 min-h-screen" style={{ background: 'var(--color-milk)' }}>
      <div className="container max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0b140c] mb-8">Мой профиль</h1>

        {/* Аватар + имя */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: 32,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #ead4a1', marginBottom: 20,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0b140c', marginBottom: 24 }}>Основные данные</h2>

          {/* Аватар */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 100, height: 100, borderRadius: '50%', cursor: 'pointer',
                overflow: 'hidden', flexShrink: 0, position: 'relative',
                border: '3px solid #e0c584', background: '#33783e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {avatarDisplay ? (
                <img src={avatarDisplay} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 36, fontWeight: 700, color: '#fff' }}>{initials}</span>
              )}
              {uploadingAvatar && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity=".3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.5)', padding: '6px 0', textAlign: 'center',
              }}>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>Изменить</span>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <div>
              <p style={{ fontWeight: 600, color: '#0b140c', marginBottom: 4 }}>{user?.name || 'Ученица'}</p>
              <p style={{ fontSize: 14, color: '#888' }}>{user?.email}</p>
              <button
                onClick={() => fileRef.current?.click()}
                style={{ marginTop: 8, fontSize: 13, color: '#33783e', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Загрузить фото
              </button>
            </div>
          </div>

          {/* Имя */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>Ваше имя</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Введите имя"
              style={{
                width: '100%', height: 48, padding: '0 16px', fontSize: 15,
                border: '2px solid #c5b99a', borderRadius: 12, outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s', color: '#0b140c',
              }}
              onFocus={e => (e.target.style.borderColor = '#33783e')}
              onBlur={e => (e.target.style.borderColor = '#c5b99a')}
            />
          </div>

          <Button onClick={handleSaveName} loading={savingName} size="md">
            Сохранить имя
          </Button>
        </div>

        {/* Смена пароля */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: 32,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #ead4a1', marginBottom: 20,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0b140c', marginBottom: 24 }}>Сменить пароль</h2>

          {[
            { label: 'Текущий пароль', value: currentPassword, set: setCurrentPassword, placeholder: 'Введите текущий пароль' },
            { label: 'Новый пароль', value: newPassword, set: setNewPassword, placeholder: 'Минимум 6 символов' },
            { label: 'Подтвердите новый пароль', value: confirmPassword, set: setConfirmPassword, placeholder: 'Повторите новый пароль' },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>{label}</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: '100%', height: 48, padding: '0 16px', fontSize: 15,
                  border: '2px solid #e8e8e8', borderRadius: 12, outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#33783e')}
                onBlur={e => (e.target.style.borderColor = '#e8e8e8')}
              />
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <input type="checkbox" id="showpw" checked={showPasswords} onChange={e => setShowPasswords(e.target.checked)} style={{ accentColor: '#33783e' }} />
            <label htmlFor="showpw" style={{ fontSize: 13, color: '#666', cursor: 'pointer' }}>Показать пароли</label>
          </div>

          <Button onClick={handleChangePassword} loading={savingPassword} size="md">
            Сменить пароль
          </Button>
        </div>

        {/* Выйти */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => { logout(); router.push('/'); }}
            style={{ color: '#a3212a', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { mockUserAccess, mockStreams } from '@/lib/mockData';
import Button from '@/components/ui/Button';

// ── Icons ──────────────────────────────────────────────────────────────────
const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IconVideo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLink = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconGraduate = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
const IconNewspaper = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z"/>
  </svg>
);
const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ── Countdown ──────────────────────────────────────────────────────────────
function useCountdown(targetIso: string) {
  const calc = () => {
    const diff = new Date(targetIso).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, over: true };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, over: false };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return t;
}

function CountdownBlock({ targetIso }: { targetIso: string }) {
  const { d, h, m, s, over } = useCountdown(targetIso);
  if (over) return (
    <div className="flex items-center gap-2 text-[#33783e] font-semibold text-sm">
      <IconClock /> Эфир идёт прямо сейчас!
    </div>
  );
  const cell = (val: number, label: string) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        background: '#33783e', color: '#fff', borderRadius: 10,
        fontWeight: 700, fontSize: 'clamp(18px,4vw,26px)',
        minWidth: 'clamp(42px,10vw,54px)', padding: '8px 4px',
        lineHeight: 1,
      }}>
        {String(val).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{label}</div>
    </div>
  );
  const sep = () => (
    <span style={{ fontSize: 22, fontWeight: 700, color: '#33783e', marginBottom: 18 }}>:</span>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(4px,1.5vw,10px)', marginTop: 12, marginBottom: 4 }}>
      {cell(d, 'дней')}
      {sep()}
      {cell(h, 'часов')}
      {sep()}
      {cell(m, 'минут')}
      {sep()}
      {cell(s, 'секунд')}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#33783e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#666]">Загрузка...</p>
      </div>
    </main>
  );

  if (!isAuthenticated) return null;

  const upcomingStream = mockStreams.find(s => s.status === 'upcoming');
  const now = new Date();
  const accessWithWarning = mockUserAccess.map(a => {
    const expires = new Date(a.expiresAt);
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { ...a, daysLeft };
  });

  const quickLinks = [
    { href: '/courses',      label: 'Все курсы',       Icon: IconBook },
    { href: '/masterclasses',label: 'Мастер-классы',   Icon: IconGraduate },
    { href: '/blog',         label: 'Блог',             Icon: IconNewspaper },
    { href: '/reviews',      label: 'Отзывы',           Icon: IconStar },
  ];

  return (
    <main className="py-10">
      <div className="container max-w-4xl">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0b140c] mb-1">
            Добрый день, {user?.name?.split(' ')[0] || 'дорогая'}!
          </h1>
          <p className="text-[#666]">Рады видеть вас в личном кабинете</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* My Courses */}
          <section className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] card-hover">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#0b140c]">
              <span className="text-[#33783e]"><IconBook /></span> Мои курсы
            </h2>
            {accessWithWarning.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[#666] mb-4">У вас пока нет активных курсов</p>
                <Button href="/courses" size="sm">Выбрать курс</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {accessWithWarning.map(a => (
                  <div key={a.courseId} className="border border-[#ead4a1] rounded-[14px] p-4">
                    <h3 className="font-semibold text-[#0b140c] mb-1">{a.courseTitle}</h3>
                    <p className="text-sm text-[#666] mb-3">
                      Доступ до: {new Date(a.expiresAt).toLocaleDateString('ru')}
                    </p>
                    {a.daysLeft <= 7 && (
                      <div className="flex items-center gap-2 bg-[#a3212a]/10 text-[#a3212a] rounded-[8px] px-3 py-2 text-sm mb-3">
                        <IconWarning /> Доступ истекает через {a.daysLeft} дн.
                      </div>
                    )}
                    <Button href={`/courses/${a.courseId}/learn`} size="sm">
                      Продолжить обучение →
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming stream */}
          <section className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] card-hover">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#0b140c]">
              <span className="text-[#33783e]"><IconVideo /></span> Ближайший эфир
            </h2>
            {upcomingStream ? (
              <div>
                <h3 className="font-semibold mb-1">{upcomingStream.title}</h3>
                <p className="text-sm text-[#666] mb-2 flex items-center gap-1">
                  <IconClock />
                  {new Date(upcomingStream.startAt).toLocaleString('ru', {
                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                <CountdownBlock targetIso={upcomingStream.startAt} />
                <div className="mt-4">
                  <Button href={`/streams/${upcomingStream.id}`} size="sm">Смотреть эфир</Button>
                </div>
              </div>
            ) : (
              <p className="text-[#666]">Пока нет запланированных эфиров</p>
            )}
          </section>

          {/* Profile */}
          <section className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] card-hover">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#0b140c]">
              <span className="text-[#33783e]"><IconUser /></span> Профиль
            </h2>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm text-[#666]">Имя</label>
                <p className="font-medium">{user?.name || '—'}</p>
              </div>
              <div>
                <label className="text-sm text-[#666]">Email</label>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <Button href="/profile" size="sm" variant="secondary">Редактировать профиль</Button>
          </section>

          {/* Quick links */}
          <section className="bg-[#ead4a1] rounded-[20px] p-6 card-hover">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#0b140c]">
              <span className="text-[#33783e]"><IconLink /></span> Быстрые ссылки
            </h2>
            <div className="space-y-2">
              {quickLinks.map(({ href, label, Icon }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 bg-white rounded-[10px] px-4 py-3 text-[#0b140c] hover:text-[#33783e] no-underline hover:no-underline transition-colors">
                  <span className="text-[#33783e]"><Icon /></span>
                  {label}
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* Logout */}
        <div className="mt-8 text-center">
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="inline-flex items-center gap-2 text-[#666] hover:text-[#a3212a] transition-colors"
          >
            <IconLogout /> Выйти из аккаунта
          </button>
        </div>

      </div>
    </main>
  );
}

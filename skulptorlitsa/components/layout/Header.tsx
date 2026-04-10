'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

const navLinks = [
  { href: '/', label: 'Главная' },
  { href: '/courses', label: 'Курсы' },
  { href: '/masterclasses', label: 'Мастер-классы' },
  { href: '/blog', label: 'Блог' },
  { href: '/about', label: 'Об Анне' },
  { href: '/reviews', label: 'Отзывы' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header
      style={{
        backgroundColor: '#33783e',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.25)' : '0 1px 4px rgba(0,0,0,0.15)',
        transition: 'box-shadow 0.3s ease',
      }}
      className="sticky top-0 z-50 text-white"
    >
      <div className="container">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline hover:no-underline flex-shrink-0">
            <Image src="/logo.png" alt="Скульптор Лица" width={36} height={36} className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9" style={{ objectFit: 'contain' }} />
            <span className="font-bold text-white leading-tight text-sm sm:text-base">
              Скульптор&nbsp;<span style={{ color: '#e0c584' }}>Лица</span>
            </span>
          </Link>

          {/* Desktop nav — md+ */}
          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="no-underline hover:no-underline transition-colors duration-200"
                style={{
                  color: pathname === link.href ? '#e0c584' : 'rgba(255,255,255,0.9)',
                  fontWeight: pathname === link.href ? 700 : 500,
                  fontSize: '15px',
                  borderBottom: pathname === link.href ? '2px solid #e0c584' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Live button — desktop */}
          <Link href="/live" className="hidden md:flex items-center gap-1.5 no-underline hover:no-underline rounded-full px-4 py-1.5 font-semibold text-sm transition-all duration-200 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.35)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4444', display: 'inline-block', boxShadow: '0 0 6px #ff4444' }} />
            Эфир
          </Link>

          {/* Auth — desktop */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard"
                  className="no-underline hover:no-underline transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
                  {user?.name?.split(' ')[0] || 'Кабинет'}
                </Link>
                <Link href="/profile"
                  className="no-underline hover:no-underline transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                  Профиль
                </Link>
                <button onClick={logout}
                  className="underline transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Выйти
                </button>
              </>
            ) : (
              <Link href="/login" className="header-login-btn no-underline hover:no-underline">
                Войти
              </Link>
            )}
          </div>

          {/* Burger — mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center rounded-lg transition-colors duration-200"
            style={{
              width: 44, height: 44, color: 'white', background: 'none', border: 'none', cursor: 'pointer',
              backgroundColor: menuOpen ? 'rgba(255,255,255,0.15)' : 'transparent',
            }}
            aria-label="Меню"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div style={{
          maxHeight: menuOpen ? '500px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <nav className="py-3 flex flex-col gap-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="no-underline hover:no-underline rounded-lg transition-all duration-200"
                style={{
                  color: pathname === link.href ? '#e0c584' : 'rgba(255,255,255,0.9)',
                  fontWeight: pathname === link.href ? 700 : 500,
                  fontSize: '16px',
                  padding: '11px 12px',
                  backgroundColor: pathname === link.href ? 'rgba(255,255,255,0.1)' : 'transparent',
                  display: 'block',
                  transform: menuOpen ? 'translateX(0)' : 'translateX(-12px)',
                  opacity: menuOpen ? 1 : 0,
                  transition: `all 0.3s ease ${i * 0.04}s`,
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/live" className="no-underline hover:no-underline flex items-center gap-2 rounded-lg transition-all duration-200"
              style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '16px', padding: '11px 12px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4444', display: 'inline-block', boxShadow: '0 0 6px #ff4444' }} />
              Эфир
            </Link>

            <div className="pt-3 mt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-3">
                  <Link href="/dashboard" className="no-underline" style={{ color: 'white', fontWeight: 600 }}>
                    Личный кабинет
                  </Link>
                  <button onClick={logout} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
                    Выйти
                  </button>
                </div>
              ) : (
                <Link href="/login" className="no-underline hover:no-underline block text-center rounded-lg py-3 font-semibold transition-colors duration-200"
                  style={{ border: '1.5px solid rgba(224,197,132,0.7)', color: '#e0c584', margin: '0 4px' }}>
                  Войти / Зарегистрироваться
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

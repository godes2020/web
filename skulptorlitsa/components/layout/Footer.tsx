import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#33783e', color: '#fff' }} className="mt-auto">
      <div className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">

          {/* Brand */}
          <div>
            <h3 style={{ color: '#e0c584' }} className="text-lg font-bold mb-3">Скульптор Лица</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)' }} className="text-sm leading-relaxed mb-3">
              Студия омоложения Анны Артемьевой. Фитнес и СПА для вашего лица, не выходя из дома.
            </p>
            <p style={{ color: '#e0c584' }} className="italic text-sm">«Полюбите своё отражение»</p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: '#e0c584' }}>Навигация</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/courses',       label: 'Курсы' },
                { href: '/masterclasses', label: 'Мастер-классы' },
                { href: '/blog',          label: 'Блог' },
                { href: '/about',         label: 'Об Анне' },
                { href: '/reviews',       label: 'Отзывы' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="no-underline hover:no-underline"
                    style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: '#e0c584' }}>Контакты</h4>
            <ul className="space-y-3 text-sm">
              <li style={{ color: 'rgba(255,255,255,0.85)' }}>
                ВКонтакте:{' '}
                <a href="https://vk.com/skulptorlitsa" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#e0c584' }} className="hover:underline">
                  vk.com/skulptorlitsa
                </a>
              </li>
              <li style={{ color: 'rgba(255,255,255,0.85)' }}>
                Email:{' '}
                <a href="mailto:info@skulptorlitsa.ru"
                  style={{ color: '#e0c584' }} className="hover:underline">
                  info@skulptorlitsa.ru
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.65)' }}
        >
          <p>© {new Date().getFullYear()} Скульптор Лица. Все права защищены.</p>
          <Link href="/privacy"
            className="no-underline hover:underline"
            style={{ color: 'rgba(255,255,255,0.65)' }}>
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </footer>
  );
}

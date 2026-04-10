import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import CourseCard from '@/components/ui/CourseCard';
import { mockCourses, mockReviews, mockBlogPosts, mockStreams } from '@/lib/mockData';
import CountdownTimer from '@/components/shared/CountdownTimer/CountdownTimer';
import { IconCheck } from '@/components/ui/Icons';
import PainCards from '@/features/home/PainCards';
import RevealSection from '@/components/ui/RevealSection';

export const metadata: Metadata = {
  title: 'Скульптор Лица — Омоложение без операций | Анна Артемьева',
  description: 'Фитнес и СПА для вашего лица, не выходя из дома. Курсы гимнастики для омоложения от Анны Артемьевой. Результат уже через 2 недели.',
  openGraph: {
    title: 'Скульптор Лица — Полюбите своё отражение',
    description: 'Онлайн-курсы по омоложению лица без операций и уколов',
    type: 'website',
  },
};

export default function HomePage() {
  const upcomingStream = mockStreams.find(s => s.status === 'upcoming');

  return (
    <main>
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#33783e] to-[#63925c] text-white">
        <div className="container py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#e0c584] font-semibold mb-3 text-sm uppercase tracking-wider animate-fade-up">
                Студия омоложения Анны Артемьевой
              </p>
              <h1 className="text-white mb-5 leading-tight text-4xl md:text-5xl animate-fade-up delay-100">
                Полюбите
                <br />
                <span className="text-[#e0c584]">своё отражение</span>
              </h1>
              <p className="text-white/90 mb-3 text-lg font-semibold animate-fade-up delay-200">
                Фитнес и СПА для вашего лица, не выходя из дома
              </p>
              <p className="text-white/75 mb-8 leading-relaxed animate-fade-up delay-300">
                Метод Анны Артемьевой — без уколов и операций.
                Гимнастика для лица, которая действительно работает.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-up delay-400">
                {[
                  { value: '2500+', label: 'учениц' },
                  { value: '4 года', label: 'авторский метод' },
                  { value: '97%', label: 'видят результат' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-xl md:text-2xl font-bold text-[#e0c584] leading-tight">{s.value}</div>
                    <div className="text-xs md:text-sm text-white/70 leading-tight mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 animate-fade-up delay-500 pb-6 md:pb-0">
                <Button href="/courses" size="lg"
                  className="!text-white"
                  style={{ background: 'linear-gradient(135deg, #bf9244 0%, #e0c584 50%, #bf9244 100%)', backgroundSize: '200% 200%' }}>
                  Выбрать курс
                </Button>
                <Button href="/about" variant="ghost" size="lg"
                  className="!text-white !border-2 !border-white/40 hover:!bg-white/10">
                  Об Анне
                </Button>
              </div>
            </div>

            <div className="relative hidden md:block py-10 animate-fade-right delay-300">
              <div className="relative aspect-[3/4] max-w-sm mx-auto">
                <div className="absolute inset-0 rounded-[20px] border-4 border-[#e0c584] overflow-hidden shadow-2xl">
                  <Image
                    src="/anna.png"
                    alt="Анна Артемьева"
                    fill className="object-cover" style={{ objectPosition: 'right top' }}
                    priority
                    sizes="400px"
                  />
                </div>
                <div className="absolute -top-4 -left-6 bg-white rounded-[14px] px-4 py-3 shadow-xl">
                  <p className="text-xs text-[#666]">Анна Артемьева</p>
                  <p className="font-bold text-[#33783e] text-sm">Косметолог-эстетист</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING STREAM BANNER */}
      {upcomingStream && (
        <section className="bg-[#ead4a1] border-y-2 border-[#bf9244]" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="bg-[#a3212a] text-white text-xs font-bold px-3 py-1 rounded mr-2">
                  СКОРО
                </span>
                <span className="font-semibold text-[#0b140c] text-sm sm:text-base">{upcomingStream.title}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <CountdownTimer targetDate={new Date(upcomingStream.startAt)} />
                <Button href="/live" size="sm" style={{ color: '#ffffff' }}>Подключиться</Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PAIN POINTS */}
      <section className="py-16">
        <div className="container">
          <RevealSection><SectionTitle title="Узнаёте себя?" subtitle="Многие женщины 45–68 лет сталкиваются с этими проблемами" center /></RevealSection>
          <RevealSection><PainCards /></RevealSection>
        </div>
      </section>

      {/* RESULTS */}
      <section className="py-16 bg-[#33783e]">
        <div className="container">
          <SectionTitle title="Что вы получите" center light />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Подтянутый овал лица и чёткий контур',
              'Уменьшение морщин на 30–50%',
              'Устранение отёчности и мешков под глазами',
              'Сияющая, увлажнённая кожа',
              'Уверенность в своём отражении',
              'Домашняя практика — 15–20 минут в день',
            ].map((r, i) => (
              <div key={i} className="card-hover-white flex items-start gap-3 bg-white/10 rounded-[14px] p-4">
                <IconCheck size={20} className="text-[#e0c584] flex-shrink-0 mt-0.5" />
                <p className="text-white">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-16">
        <div className="container">
          <SectionTitle title="Скульптор Лица vs. Салон" center />
          <div className="overflow-x-auto rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <table className="w-full border-collapse text-base bg-white">
              <thead>
                <tr className="bg-[#ead4a1]">
                  <th className="px-6 py-4 text-left text-[#0b140c]">Параметр</th>
                  <th className="px-6 py-4 text-center text-[#666]">Салон</th>
                  <th className="px-6 py-4 text-center text-[#33783e] font-bold">Скульптор Лица</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Стоимость', 'от 5 000 ₽/сеанс', 'от 1 900 ₽ за курс'],
                  ['Время', 'поход в салон 2–3 часа', 'дома, 15–20 минут'],
                  ['Результат', 'держится 1–3 недели', 'накапливается, долго'],
                  ['Безопасность', 'инъекции, риски', 'натурально, без риска'],
                  ['Доступность', 'по записи', 'в любое удобное время'],
                ].map(([param, salon, us], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fffaee]'}>
                    <td className="px-6 py-4 font-medium">{param}</td>
                    <td className="px-6 py-4 text-center text-[#666]">{salon}</td>
                    <td className="px-6 py-4 text-center text-[#33783e] font-semibold">{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-[#ead4a1]">
        <div className="container">
          <SectionTitle title="Как это работает" center />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Регистрация', text: 'Войдите через ВКонтакте или email — займёт одну минуту' },
              { step: '2', title: 'Выбор курса', text: 'Выберите программу под свои задачи и получите доступ' },
              { step: '3', title: 'Занятия дома', text: 'Смотрите видеоуроки и занимайтесь когда удобно' },
              { step: '4', title: 'Результат', text: 'Уже через 2–4 недели вы увидите заметный результат' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#33783e] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h4 className="font-bold text-[#0b140c] mb-2 text-lg">{s.title}</h4>
                <p className="text-[#666] text-base">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <SectionTitle title="Наши курсы" subtitle="Выберите программу, которая подходит вам" />
            <Button href="/courses" variant="ghost" size="sm" className="hidden sm:flex mb-6">Все курсы →</Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCourses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Button href="/courses" variant="secondary">Все курсы</Button>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-16 bg-[#ead4a1]">
        <div className="container">
          <SectionTitle title="Последние отзывы" center />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockReviews.slice(0, 3).map(r => (
              <div key={r.id} className="card-hover bg-white rounded-[20px] p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div className="flex text-[#bf9244] mb-3 text-xl">{'★'.repeat(r.rating)}</div>
                <p className="text-[#0b140c] leading-relaxed mb-4">&laquo;{r.text}&raquo;</p>
                <div className="flex items-center gap-3 border-t border-[#ead4a1] pt-4">
                  <div className="w-10 h-10 rounded-full bg-[#33783e] text-white flex items-center justify-center font-bold flex-shrink-0">
                    {r.author[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{r.author}{r.age ? `, ${r.age} лет` : ''}</p>
                    {r.courseTitle && <p className="text-sm text-[#666]">{r.courseTitle}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button href="/reviews" variant="secondary">Все отзывы</Button>
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <SectionTitle title="Полезные статьи" />
            <Button href="/blog" variant="ghost" size="sm" className="hidden sm:flex mb-6">Блог →</Button>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {mockBlogPosts.map(p => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group no-underline hover:no-underline">
                <article className="card-hover bg-white rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                  <div className="relative aspect-video overflow-hidden">
                    <Image src={p.cover} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="400px" />
                  </div>
                  <div className="p-5">
                    <div className="text-sm text-[#666] mb-2">
                      {new Date(p.publishedAt).toLocaleDateString('ru', { day: 'numeric', month: 'long' })} · {p.readTime} мин
                    </div>
                    <h3 className="font-bold text-[#0b140c] mb-2 group-hover:text-[#33783e] transition-colors leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-[#666] text-base line-clamp-2">{p.excerpt}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#33783e] text-white text-center">
        <div className="container max-w-2xl">
          <h2 className="text-white mb-4 text-3xl font-bold">Начните путь к молодости сегодня</h2>
          <p className="text-white/80 mb-8 text-xl">Первые результаты уже через 2 недели регулярных занятий</p>
          <Button href="/courses" size="lg"
            className="!text-white"
            style={{ background: 'linear-gradient(135deg, #bf9244 0%, #e0c584 50%, #bf9244 100%)', backgroundSize: '200% 200%' }}>
            Выбрать курс
          </Button>
        </div>
      </section>
    </main>
  );
}

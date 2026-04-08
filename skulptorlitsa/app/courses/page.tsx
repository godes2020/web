import type { Metadata } from 'next';
import SectionTitle from '@/components/ui/SectionTitle';
import CourseCard from '@/components/ui/CourseCard';
import { mockCourses } from '@/lib/mockData';

export const metadata: Metadata = {
  title: 'Курсы по омоложению лица | Скульптор Лица',
  description: 'Выберите курс по гимнастике для лица от Анны Артемьевой. Онлайн-обучение для женщин 45–68 лет.',
};

export default function CoursesPage() {
  return (
    <main className="py-12">
      <div className="container">
        <SectionTitle
          title="Все курсы"
          subtitle="Программы омоложения лица для занятий дома. Выберите подходящий уровень."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {mockCourses.map(c => <CourseCard key={c.id} course={c} />)}
        </div>

        {/* FAQ */}
        <div className="bg-[#ead4a1] rounded-[20px] p-8">
          <h2 className="text-2xl font-bold mb-6">Часто задаваемые вопросы</h2>
          <div className="space-y-4">
            {[
              { q: 'С какого возраста можно заниматься?', a: 'Наши курсы разработаны специально для женщин 45–68 лет. Упражнения мягкие, без перегрузок.' },
              { q: 'Нужно ли специальное оборудование?', a: 'Нет! Всё что нужно — это ваши руки, зеркало и 15–20 минут в день.' },
              { q: 'Сколько времени до результата?', a: 'Первые изменения большинство учениц замечают через 2–4 недели регулярных занятий.' },
              { q: 'Как долго открыт доступ к курсу?', a: 'Стандартный доступ — 6 месяцев. За это время вы можете пересматривать уроки неограниченное количество раз.' },
            ].map((item, i) => (
              <details key={i} className="bg-white rounded-[14px] p-5 group">
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between text-base">
                  {item.q}
                  <span className="text-[#33783e] text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-[#666] leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

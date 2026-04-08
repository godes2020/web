import type { Metadata } from 'next';
import { mockReviews } from '@/lib/mockData';
import SectionTitle from '@/components/ui/SectionTitle';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Отзывы учениц | Скульптор Лица',
  description: 'Реальные отзывы учениц о курсах по омоложению лица от Анны Артемьевой.',
};

export default function ReviewsPage() {
  return (
    <main className="py-12">
      <div className="container">
        <SectionTitle
          title="Отзывы учениц"
          subtitle="Реальные результаты реальных женщин. Без фотошопа и постановки."
          center
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mockReviews.map(r => (
            <div key={r.id} className="card-hover bg-white rounded-[20px] p-6 flex flex-col">
              <div className="flex text-[#bf9244] text-xl mb-3">{'★'.repeat(r.rating)}</div>
              <p className="text-[#0b140c] leading-relaxed mb-4 flex-1">&laquo;{r.text}&raquo;</p>
              <div className="border-t border-[#ead4a1] pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#33783e] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {r.author[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{r.author}{r.age ? `, ${r.age} лет` : ''}</p>
                  {r.courseTitle && <p className="text-xs text-[#666]">{r.courseTitle}</p>}
                  <p className="text-xs text-[#666]">{new Date(r.date).toLocaleDateString('ru', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center bg-[#33783e] rounded-[20px] py-12 px-6">
          <h2 className="text-white text-2xl font-bold mb-3">Хотите такой же результат?</h2>
          <p className="text-white/80 mb-6">Присоединяйтесь к тысячам учениц, которые уже преобразили своё лицо</p>
          <Button href="/courses" size="lg" className="!bg-[#bf9244] !text-[#0b140c] hover:!bg-[#e0c584]">
            Начать сейчас
          </Button>
        </div>
      </div>
    </main>
  );
}

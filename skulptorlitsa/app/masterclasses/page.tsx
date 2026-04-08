import Image from 'next/image';
import type { Metadata } from 'next';
import { mockMasterClasses } from '@/lib/mockData';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';

export const metadata: Metadata = {
  title: 'Мастер-классы | Скульптор Лица',
  description: 'Онлайн мастер-классы по гимнастике для лица от Анны Артемьевой. Живые занятия в прямом эфире.',
};

export default function MasterClassesPage() {
  return (
    <main className="py-12">
      <div className="container">
        <SectionTitle
          title="Мастер-классы"
          subtitle="Живые онлайн-занятия с Анной в прямом эфире. Ограниченное количество мест."
        />

        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {mockMasterClasses.map(mc => (
            <article key={mc.id} className="card-hover bg-white rounded-[20px] overflow-hidden">
              <div className="relative aspect-video overflow-hidden">
                <Image src={mc.cover} alt={mc.title} fill className="object-cover" sizes="600px" />
                <div className="absolute top-3 right-3 bg-[#a3212a] text-white text-sm font-bold px-3 py-1 rounded-full">
                  Осталось {mc.spotsLeft} мест
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#0b140c] mb-3">{mc.title}</h2>
                <p className="text-[#666] mb-4">{mc.description}</p>

                <div className="flex gap-6 mb-4 text-sm">
                  <div>
                    <p className="text-[#666]">Дата</p>
                    <p className="font-semibold">
                      {new Date(mc.date).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#666]">Время</p>
                    <p className="font-semibold">
                      {new Date(mc.date).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#666]">Длительность</p>
                    <p className="font-semibold">{mc.duration}</p>
                  </div>
                </div>

                <div className="bg-[#fffaee] rounded-[8px] p-4 mb-5">
                  <p className="text-sm font-semibold text-[#0b140c] mb-2">Темы:</p>
                  <ul className="space-y-1">
                    {mc.topics.map((t, i) => (
                      <li key={i} className="text-sm text-[#666] flex items-center gap-2">
                        <span className="text-[#bf9244]">✓</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-[#33783e]">{mc.price.toLocaleString('ru')} ₽</span>
                  </div>
                  <Button href="/login" size="md">Записаться</Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="bg-[#ead4a1] rounded-[20px] p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Хотите узнавать о новых мастер-классах первой?</h2>
          <p className="text-[#666] mb-5">Подпишитесь на рассылку и не пропустите ближайшие события</p>
          <Button href="/login">Подписаться</Button>
        </div>
      </div>
    </main>
  );
}

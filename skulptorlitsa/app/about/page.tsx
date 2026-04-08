import Image from 'next/image';
import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import { IconGraduate, IconAward, IconUsers, IconBook } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: 'Об Анне Артемьевой | Скульптор Лица',
  description: 'Анна Артемьева — косметолог-эстетист, тренер по гимнастике для лица. Авторский метод омоложения без операций.',
};

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-[#33783e] text-white py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square max-w-sm mx-auto md:mx-0">
              <div className="absolute inset-0 rounded-[20px] border-4 border-[#e0c584] overflow-hidden shadow-2xl">
                <Image
                  src="/anna.png"
                  alt="Анна Артемьева"
                  fill className="object-cover" style={{ objectPosition: '60% top' }}
                  priority sizes="500px"
                />
              </div>
            </div>
            <div>
              <h1 className="text-white mb-3 text-4xl">Анна Артемьева</h1>
              <p className="text-[#e0c584] font-semibold mb-5 text-lg">Косметолог-эстетист · Тренер по гимнастике для лица</p>
              <p className="text-white/85 leading-relaxed mb-4">
                4 года я помогаю женщинам 45–68 лет выглядеть моложе без уколов и операций.
                Мой авторский метод «Скульптор Лица» объединяет лучшее из профессиональной косметологии и спортивных практик.
              </p>
              <p className="text-white/80 leading-relaxed">
                Более 2500 учениц уже видят результат: подтянутый овал, сияющая кожа,
                уверенность в себе — всё это реально без выхода из дома.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <SectionTitle title="История метода" />
          <div className="prose prose-lg max-w-none">
            <p className="text-[#0b140c] leading-relaxed mb-4">
              Всё началось с личного опыта. После 45 лет я стала замечать, что лицо меняется — овал плывёт,
              кожа теряет тонус. Инъекции и дорогие салонные процедуры давали временный результат,
              но требовали постоянных вложений времени и денег.
            </p>
            <p className="text-[#0b140c] leading-relaxed mb-4">
              Как специалист с медицинским образованием, я начала изучать анатомию лицевых мышц и разрабатывать
              собственную систему упражнений. Через несколько месяцев результат превзошёл мои ожидания.
            </p>
            <p className="text-[#0b140c] leading-relaxed">
              Сегодня метод «Скульптор Лица» — это проверенная система, которой доверяют тысячи женщин
              по всей России и СНГ.
            </p>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-16 bg-[#ead4a1]">
        <div className="container">
          <SectionTitle title="Образование и опыт" center />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { Icon: IconGraduate, title: 'Медицинское образование', text: 'Специализация в эстетической косметологии' },
              { Icon: IconBook,     title: '4 года практики', text: 'Авторский метод омоложения без инъекций' },
              { Icon: IconUsers,    title: '2500+ учениц', text: 'Россия, Беларусь, Казахстан, Украина' },
              { Icon: IconAward,    title: 'Признание', text: 'Лауреат профессиональных конкурсов 2024–2025' },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="card-hover bg-white rounded-[24px] p-6 text-center">
                <div className="flex justify-center items-center w-14 h-14 rounded-full bg-[#f0f8f1] mx-auto mb-4">
                  <Icon size={28} className="text-[#33783e]" />
                </div>
                <h3 className="font-bold text-[#0b140c] mb-2">{title}</h3>
                <p className="text-[#666] text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="container max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Начните заниматься вместе с Анной</h2>
          <p className="text-[#666] mb-8">Выберите курс и сделайте первый шаг к молодости сегодня</p>
          <Button href="/courses" size="lg">Выбрать курс</Button>
        </div>
      </section>
    </main>
  );
}

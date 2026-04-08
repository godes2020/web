'use client';

import { IconSad, IconEye, IconMoney } from '@/components/ui/Icons';

const cards = [
  { Icon: IconSad,   title: 'Овал лица поплыл',   text: 'Щёки опустились, появился второй подбородок. Хочется вернуть чёткий овал без операций.' },
  { Icon: IconEye,   title: 'Мешки и морщины',    text: 'Утром смотришь в зеркало — лицо опухшее, уставшее. Морщины становятся глубже с каждым годом.' },
  { Icon: IconMoney, title: 'Дорогие процедуры',  text: 'Салоны требуют всё больше денег, а результат держится недолго. Хочется простого решения дома.' },
] as const;

export default function PainCards() {
  return (
    <div className="grid sm:grid-cols-3 gap-6">
      {cards.map(({ Icon, title, text }) => (
        <div
          key={title}
          className="bg-white rounded-[24px] p-8 text-center cursor-default"
          style={{
            boxShadow: '0 4px 24px rgba(51,120,62,0.10)',
            border: '1.5px solid #ead4a1',
            transition: 'box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.boxShadow = '0 12px 40px rgba(51,120,62,0.22)';
            el.style.transform = 'translateY(-6px)';
            el.style.borderColor = '#bf9244';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.boxShadow = '0 4px 24px rgba(51,120,62,0.10)';
            el.style.transform = 'translateY(0)';
            el.style.borderColor = '#ead4a1';
          }}
        >
          <div
            className="flex justify-center items-center mb-5 mx-auto rounded-full"
            style={{ width: 72, height: 72, backgroundColor: '#f0f8f1' }}
          >
            <Icon size={36} className="text-[#33783e]" />
          </div>
          <h3 className="font-bold text-[#0b140c] mb-3 text-xl">{title}</h3>
          <p className="text-[#666] text-base leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { mockCourses, mockReviews } from '@/lib/mockData';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ApplicationForm from '@/features/courses/ApplicationForm';

interface Props {
  params: { id: string };
}

export default function CoursePage({ params }: Props) {
  const [showForm, setShowForm] = useState(false);
  const course = mockCourses.find(c => c.id === params.id);

  if (!course) notFound();

  const courseReviews = mockReviews.filter(r => r.courseTitle === course.title);

  return (
    <main>
      {/* Hero */}
      <section className="bg-[#33783e] text-white py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="bg-[#bf9244] text-[#0b140c] text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block">
                {course.category}
              </span>
              <h1 className="text-white mb-4 text-4xl">{course.title}</h1>
              <p className="text-white/85 leading-relaxed mb-6">{course.description}</p>
              <div className="flex gap-6 mb-6">
                <div>
                  <p className="text-[#e0c584] font-bold text-lg">{course.duration}</p>
                  <p className="text-white/60 text-sm">продолжительность</p>
                </div>
                <div>
                  <p className="text-[#e0c584] font-bold text-lg">{course.lessonsCount}</p>
                  <p className="text-white/60 text-sm">видеоуроков</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-3xl font-bold text-[#e0c584]">{course.price.toLocaleString('ru')} ₽</span>
                  {course.oldPrice && (
                    <span className="ml-2 text-white/50 line-through">{course.oldPrice.toLocaleString('ru')} ₽</span>
                  )}
                </div>
                <Button onClick={() => setShowForm(true)} size="lg"
                  className="!bg-[#bf9244] !text-[#0b140c] hover:!bg-[#e0c584]">
                  Записаться
                </Button>
              </div>
            </div>
            <div className="relative aspect-video rounded-[20px] overflow-hidden shadow-2xl">
              <Image src={course.cover} alt={course.title} fill className="object-cover" sizes="600px" />
            </div>
          </div>
        </div>
      </section>

      {/* For Whom */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Для кого этот курс</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {course.forWhom.map((item, i) => (
              <div key={i} className="bg-[#ead4a1] rounded-[14px] p-5 flex gap-3">
                <span className="text-[#33783e] text-xl flex-shrink-0">✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 bg-[#fffaee]">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Что вы получите</h2>
          <ul className="space-y-3">
            {course.results.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#33783e] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-[#0b140c]">{r}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Outline */}
      {course.outline && (
        <section className="py-12">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Программа курса</h2>
            <div className="space-y-4">
              {course.outline.map((module, i) => (
                <div key={i} className="bg-white rounded-[14px] border border-[#ead4a1] overflow-hidden">
                  <div className="flex items-center gap-4 p-5 bg-[#ead4a1]/30">
                    <span className="w-8 h-8 rounded-full bg-[#33783e] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {i + 1}
                    </span>
                    <h3 className="font-semibold text-[#0b140c]">{module.title}</h3>
                  </div>
                  <ul className="p-5 space-y-2">
                    {module.lessons.map((lesson, j) => (
                      <li key={j} className="flex items-center gap-3 text-[#666]">
                        <span className="text-[#bf9244]">▶</span>
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {courseReviews.length > 0 && (
        <section className="py-12 bg-[#ead4a1]">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Отзывы об этом курсе</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {courseReviews.map(r => (
                <div key={r.id} className="bg-white rounded-[20px] p-6">
                  <div className="text-[#bf9244] text-xl mb-3">{'★'.repeat(r.rating)}</div>
                  <p className="text-[#0b140c] leading-relaxed mb-4">&laquo;{r.text}&raquo;</p>
                  <p className="font-semibold text-sm">{r.author}{r.age ? `, ${r.age} лет` : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="container max-w-xl">
          <h2 className="text-2xl font-bold mb-3">Готовы начать?</h2>
          <p className="text-[#666] mb-6">Оставьте заявку, и мы свяжемся с вами в течение 24 часов</p>
          <Button onClick={() => setShowForm(true)} size="lg">Записаться на курс</Button>
        </div>
      </section>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Запись на курс">
        <ApplicationForm courseId={course.id} courseTitle={course.title} onSuccess={() => setShowForm(false)} />
      </Modal>
    </main>
  );
}

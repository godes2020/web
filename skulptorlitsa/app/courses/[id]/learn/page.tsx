'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { mockCourses, mockUserAccess } from '@/lib/mockData';
import HlsPlayer from '@/components/shared/HlsPlayer/HlsPlayer';
import Button from '@/components/ui/Button';

interface Props {
  params: Promise<{ id: string }>;
}

const demoLessons = [
  { id: '1', title: 'Введение: анатомия лица', duration: '8 мин', videoUrl: 'https://test-streams.mux.com/x36xhzz/sd/8/index.m3u8' },
  { id: '2', title: 'Базовые упражнения', duration: '15 мин', videoUrl: 'https://test-streams.mux.com/x36xhzz/sd/8/index.m3u8' },
  { id: '3', title: 'Самомассаж утром', duration: '12 мин', videoUrl: 'https://test-streams.mux.com/x36xhzz/sd/8/index.m3u8' },
];

export default function LearnPage({ params }: Props) {
  const { id } = use(params);
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  const course = mockCourses.find(c => c.id === id);
  const hasAccess = mockUserAccess.some(a => a.courseId === id);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?returnUrl=/courses/${id}/learn`);
    }
  }, [isLoading, isAuthenticated, router, id]);

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[#33783e] border-t-transparent rounded-full animate-spin" />
  </div>;

  if (!isAuthenticated) return null;

  if (!hasAccess) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-3">Нет доступа к курсу</h2>
          <p className="text-[#666] mb-6">Этот курс недоступен по вашей подписке. Оформите доступ, чтобы начать обучение.</p>
          <Button href={`/courses/${id}`}>Получить доступ</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="py-8">
      <div className="container">
        <div className="mb-4 flex items-center gap-2">
          <Button href={`/courses/${id}`} variant="ghost" size="sm">← Назад к курсу</Button>
        </div>

        <h1 className="text-2xl font-bold mb-6">{course?.title}</h1>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Player */}
          <div>
            <HlsPlayer
              src={demoLessons[0].videoUrl}
              poster="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80"
            />
            <div className="mt-4 bg-white rounded-[14px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <h2 className="text-lg font-bold mb-1">{demoLessons[0].title}</h2>
              <p className="text-[#666] text-sm">Урок 1 · {demoLessons[0].duration}</p>
            </div>
          </div>

          {/* Lessons list */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="p-4 bg-[#ead4a1]/30 border-b border-[#ead4a1]">
              <h3 className="font-bold text-[#0b140c]">Уроки курса</h3>
            </div>
            <ul>
              {demoLessons.map((lesson, i) => (
                <li key={lesson.id}
                  className={`flex items-center gap-4 p-4 border-b border-[#fffaee] cursor-pointer
                    hover:bg-[#fffaee] transition-colors
                    ${i === 0 ? 'bg-[#33783e]/5 border-l-4 border-l-[#33783e]' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                    ${i === 0 ? 'bg-[#33783e] text-white' : 'bg-[#ead4a1] text-[#0b140c]'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{lesson.title}</p>
                    <p className="text-xs text-[#666]">{lesson.duration}</p>
                  </div>
                  <span className="text-[#33783e] text-sm flex-shrink-0">▶</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

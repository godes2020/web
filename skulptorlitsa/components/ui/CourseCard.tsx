import Link from 'next/link';
import Image from 'next/image';
import type { Course } from '@/types';
import Button from './Button';

interface Props {
  course: Course;
}

export default function CourseCard({ course }: Props) {
  return (
    <article
      className="card-hover bg-white rounded-[24px] overflow-hidden flex flex-col
                 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-t-[3px] border-[#bf9244]"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={course.cover}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <span className="text-xs font-semibold text-[--color-gold] uppercase tracking-wider mb-2">
          {course.category}
        </span>

        <h3 className="text-[--font-size-lg] font-bold text-[--color-text] mb-2 leading-snug">
          {course.title}
        </h3>

        <p className="text-[--color-text-muted] text-sm mb-4 line-clamp-2 flex-1">
          {course.shortDescription}
        </p>

        <div className="flex items-center gap-4 text-sm text-[--color-text-muted] mb-5">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.882V15.12a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {course.lessonsCount} уроков
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-[--color-primary]">{course.price.toLocaleString('ru')} ₽</span>
            {course.oldPrice && (
              <span className="ml-2 text-sm text-[--color-text-muted] line-through">
                {course.oldPrice.toLocaleString('ru')} ₽
              </span>
            )}
          </div>
          <Button href={`/courses/${course.id}`} variant="secondary" size="sm">
            Подробнее
          </Button>
        </div>
      </div>
    </article>
  );
}

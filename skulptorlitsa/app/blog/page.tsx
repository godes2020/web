import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { mockBlogPosts } from '@/lib/mockData';
import SectionTitle from '@/components/ui/SectionTitle';

export const metadata: Metadata = {
  title: 'Блог | Скульптор Лица',
  description: 'Полезные статьи о гимнастике для лица, уходе за кожей и омоложении от Анны Артемьевой.',
};

export default function BlogPage() {
  return (
    <main className="py-12">
      <div className="container">
        <SectionTitle title="Блог" subtitle="Полезные статьи об уходе за лицом и омоложении" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBlogPosts.map(p => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="group no-underline hover:no-underline">
              <article className="card-hover bg-white rounded-[24px] overflow-hidden h-full flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={p.cover} alt={p.title} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="400px"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex gap-2 flex-wrap mb-3">
                    {p.tags.map(t => (
                      <span key={t} className="bg-[#ead4a1] text-[#0b140c] text-xs px-2 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                  <h2 className="font-bold text-[#0b140c] mb-2 text-xl group-hover:text-[#33783e] transition-colors leading-snug flex-1">
                    {p.title}
                  </h2>
                  <p className="text-[#666] mb-4 line-clamp-3">{p.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-[#666] pt-4 border-t border-[#ead4a1]">
                    <span>{new Date(p.publishedAt).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span>{p.readTime} мин чтения</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

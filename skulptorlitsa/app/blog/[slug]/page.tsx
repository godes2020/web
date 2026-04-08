import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockBlogPosts } from '@/lib/mockData';
import Button from '@/components/ui/Button';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return mockBlogPosts.map(p => ({ slug: p.slug }));
}

export default function BlogPostPage({ params }: Props) {
  const post = mockBlogPosts.find(p => p.slug === params.slug);
  if (!post) notFound();

  const related = mockBlogPosts.filter(p => p.slug !== post.slug).slice(0, 2);

  return (
    <main className="py-12">
      <div className="container max-w-3xl">
        <Link href="/blog" className="text-[#33783e] text-sm flex items-center gap-1 mb-6 no-underline hover:underline">
          ← Назад к блогу
        </Link>

        <div className="flex gap-2 flex-wrap mb-4">
          {post.tags.map(t => (
            <span key={t} className="bg-[#ead4a1] text-[#0b140c] text-xs px-2 py-1 rounded-full">{t}</span>
          ))}
        </div>

        <h1 className="text-4xl font-bold text-[#0b140c] mb-4 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-[#666] mb-8">
          <span>Анна Артемьева</span>
          <span>·</span>
          <span>{new Date(post.publishedAt).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>·</span>
          <span>{post.readTime} мин чтения</span>
        </div>

        <div className="relative aspect-video rounded-[20px] overflow-hidden mb-10 shadow-[0_8px_32px_rgba(0,0,0,0.14)]">
          <Image src={post.cover} alt={post.title} fill className="object-cover" sizes="800px" priority />
        </div>

        {/* Article content – using excerpt as placeholder since content is empty in mock */}
        <div className="prose prose-lg max-w-none">
          <p className="text-[#0b140c] leading-relaxed text-xl mb-6 font-medium">{post.excerpt}</p>

          <p className="text-[#0b140c] leading-relaxed mb-4">
            Гимнастика для лица — это не просто упражнения. Это комплексный подход к восстановлению
            мышечного тонуса, улучшению кровообращения и лимфодренажа. Регулярные занятия дают
            накопительный эффект, который со временем становится всё заметнее.
          </p>

          <p className="text-[#0b140c] leading-relaxed mb-4">
            В отличие от инъекций, которые дают мгновенный, но временный результат,
            правильные упражнения укрепляют мышечный корсет лица изнутри.
            Это как фитнес для тела — вы не теряете форму после первой тренировки.
          </p>

          <div className="bg-[#ead4a1] rounded-[14px] p-6 my-6">
            <p className="font-semibold text-[#0b140c] mb-2">💡 Совет от Анны:</p>
            <p className="text-[#0b140c]">
              Занимайтесь утром после умывания — в это время мышцы лица наиболее восприимчивы
              к нагрузке. Начните с 10 минут и постепенно увеличивайте до 20–30 минут.
            </p>
          </div>

          <p className="text-[#0b140c] leading-relaxed">
            Хотите получить полный комплекс упражнений? Присоединяйтесь к нашим курсам
            и занимайтесь под руководством Анны Артемьевой в удобное для вас время.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-[#ead4a1] text-center">
          <p className="text-[#0b140c] font-semibold mb-4">Понравилась статья? Начните заниматься уже сегодня!</p>
          <Button href="/courses">Выбрать курс</Button>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-5">Другие статьи</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {related.map(r => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group no-underline hover:no-underline">
                  <div className="bg-white rounded-[14px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.14)] transition-shadow flex gap-4">
                    <div className="relative w-24 flex-shrink-0">
                      <Image src={r.cover} alt={r.title} fill className="object-cover" sizes="100px" />
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-[#0b140c] group-hover:text-[#33783e] transition-colors leading-snug">
                        {r.title}
                      </p>
                      <p className="text-xs text-[#666] mt-1">{r.readTime} мин</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

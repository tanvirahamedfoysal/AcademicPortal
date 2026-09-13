import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock3, Share2 } from 'lucide-react';
import MainLayout from '../../../components/MainLayout';
import { getPublicArticle } from '../../../lib/public-api';

function formatDate(value?: string | null) {
  if (!value) return 'Publication date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Publication date unavailable';
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getPublicArticle(id);

  if (!article) {
    return (
      <MainLayout>
        <section className="page-shell py-24 text-center">
          <h1 className="font-serif text-4xl font-bold">Publication not available</h1>
          <p className="mt-4 text-slate-500">The article may not be published, or the API is temporarily unavailable.</p>
          <Link href="/articles" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#5f91a0] px-5 py-3 text-sm font-bold text-white"><ArrowLeft className="h-4 w-4" /> Back to publications</Link>
        </section>
      </MainLayout>
    );
  }

  const wordCount = article.article_body?.trim().split(/\s+/).filter(Boolean).length || 0;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 220));

  return (
    <MainLayout>
      <article>
        <header className="border-b border-slate-200 bg-[#fffdfb]">
          <div className="page-shell max-w-5xl py-14 lg:py-20">
            <Link href="/articles" className="inline-flex items-center gap-2 text-sm font-bold text-[#5f91a0]"><ArrowLeft className="h-4 w-4" /> Publications</Link>
            <p className="eyebrow mt-12">Research article</p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl">{article.article_title}</h1>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#689aa6]" /> {formatDate(article.published_at)}</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#689aa6]" /> {readMinutes} min read</span>
              <span className="inline-flex items-center gap-2"><Share2 className="h-4 w-4 text-[#689aa6]" /> Public research record</span>
            </div>
          </div>
        </header>
        <div className="page-shell max-w-5xl py-14 lg:py-20">
          <div className="academic-card p-7 sm:p-10 lg:p-14">
            <div className="whitespace-pre-wrap text-[17px] leading-8 text-slate-700">{article.article_body}</div>
          </div>
        </div>
      </article>
    </MainLayout>
  );
}

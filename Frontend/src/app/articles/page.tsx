import Link from 'next/link';
import { ArrowUpRight, BookOpenText, CalendarDays, FileText, Search } from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import { getPublicArticles } from '../../lib/public-api';

export const metadata = {
  title: 'Publications',
  description: 'Published research articles and scholarly writing.',
};

function formatDate(value?: string | null) {
  if (!value) return 'Publication date pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Publication date pending';
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export default async function ArticlesPage() {
  const articles = await getPublicArticles();

  return (
    <MainLayout>
      <section className="border-b border-slate-200 bg-[#fffdfb]">
        <div className="page-shell py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl">
              <p className="eyebrow">Scholarly output</p>
              <h1 className="mt-4 font-serif text-5xl font-bold tracking-[-0.045em] sm:text-6xl">Publications & research writing</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">A public record of published articles and academic writing, organized for fast scanning and focused reading.</p>
            </div>
            <div className="rounded-2xl border border-[#cfe1ea] bg-[#dff7f6] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5f91a0]">Published works</p>
              <p className="mt-1 font-serif text-3xl font-bold text-[#5f91a0]">{articles.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 lg:py-20">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><BookOpenText className="h-4 w-4 text-[#689aa6]" /> Research archive</div>
          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><Search className="h-3.5 w-3.5" /> Use your browser search to find keywords</div>
        </div>

        {articles.length > 0 ? (
          <div className="grid gap-4">
            {articles.map((article, index) => (
              <Link key={article.article_uuid} href={`/articles/${article.article_uuid}`} className="group academic-card grid gap-5 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-[#a9d7df]/20 hover:shadow-[0_18px_50px_rgba(15,35,30,0.08)] sm:grid-cols-[70px_1fr_auto] sm:items-center sm:p-7">
                <div className="font-serif text-2xl font-bold text-slate-300">{String(index + 1).padStart(2, '0')}</div>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1.5 text-[#5f91a0]"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(article.published_at)}</span>
                    <span>•</span>
                    <span>Research article</span>
                  </div>
                  <h2 className="max-w-4xl font-serif text-2xl font-bold leading-8 tracking-[-0.02em] text-slate-950 group-hover:text-[#5f91a0]">{article.article_title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Open the full publication record and article body.</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition group-hover:bg-[#5f91a0] group-hover:text-white"><ArrowUpRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="academic-card px-6 py-16 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#dff7f6] text-[#5f91a0]"><FileText className="h-6 w-6" /></span>
            <h2 className="mt-6 font-serif text-2xl font-bold">No public articles yet</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">Articles marked as PUBLISHED in the existing backend will appear here automatically.</p>
          </div>
        )}
      </section>
    </MainLayout>
  );
}

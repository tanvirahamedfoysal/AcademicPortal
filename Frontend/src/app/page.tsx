import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  FileArchive,
  Network,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import ResearcherPortfolioHero from '../components/public/ResearcherPortfolioHero';
import {
  getCollaborators,
  getPortfolio,
  getPublicArticles,
  getRepositoryDocuments,
  getStudents,
} from '../lib/public-api';
import { getVisibleResearchInterests, parsePortfolioMedia } from '../lib/portfolio-media';

export const revalidate = 60;

function formatDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
}

export default async function HomePage() {
  const [portfolio, articles, collaborators, students, documents] = await Promise.all([
    getPortfolio(),
    getPublicArticles(),
    getCollaborators(),
    getStudents(),
    getRepositoryDocuments(),
  ]);

  const media = parsePortfolioMedia(portfolio?.research_interests);
  const researcherArticles = media.ownerUuid
    ? articles.filter((article) => String(article.author_uuid || '').toLowerCase() === media.ownerUuid.toLowerCase())
    : articles;
  const researcherName = media.researcherInfo.fullName || 'Dr. Tania Islam';
  const interests = getVisibleResearchInterests(portfolio?.research_interests);
  const researchDescription = portfolio?.research_description?.trim() || '';

  return (
    <MainLayout>
      <ResearcherPortfolioHero portfolio={portfolio} media={media} articles={researcherArticles} />

      <section className="border-y border-slate-200 bg-[#fffdfb]">
        <div className="page-shell grid gap-0 md:grid-cols-4">
          {([
            { count: researcherArticles.length, label: 'Published works', Icon: BookOpenText },
            { count: documents.length, label: 'Research resources', Icon: FileArchive },
            { count: collaborators.length, label: 'Collaborators', Icon: Network },
            { count: students.length, label: 'Learning community', Icon: UsersRound },
          ] satisfies Array<{ count: number; label: string; Icon: LucideIcon }>).map(({ count, label, Icon }, index) => (
            <div key={label} className={`flex items-center gap-4 py-7 md:px-7 ${index > 0 ? 'border-t border-slate-200 md:border-l md:border-t-0' : ''}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#dff7f6] text-[#5f91a0]"><Icon className="h-5 w-5" /></span>
              <div><p className="font-serif text-2xl font-bold text-slate-950">{count}</p><p className="mt-0.5 text-xs font-semibold text-slate-500">{label}</p></div>
            </div>
          ))}
        </div>
      </section>

      {(researchDescription || interests.length > 0) && (
        <section className="page-shell py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
            <div>
              <h2 className="section-title">Research focus</h2>
              {researchDescription && <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-8 text-slate-600">{researchDescription}</p>}
              {interests.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {interests.slice(0, 12).map((interest) => (
                    <span key={interest} className="rounded-full border border-[#cde3ea] bg-[#edf6ff] px-4 py-2 text-xs font-semibold text-[#527f8f]">{interest}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="academic-card p-7 sm:p-8">
                <BookOpenText className="h-7 w-7 text-[#5f91a0]" />
                <h3 className="mt-6 font-serif text-2xl font-bold tracking-[-0.02em]">Research &amp; teaching</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">Published work, teaching material, and research resources are collected here for students and collaborators.</p>
              </div>
              <div className="academic-card p-7 sm:p-8">
                <Network className="h-7 w-7 text-[#5f91a0]" />
                <h3 className="mt-6 font-serif text-2xl font-bold tracking-[-0.02em]">Collaboration</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">The portfolio also includes current collaborators, academic connections, and ways to get in touch.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-y border-[#dce7ee] bg-[#fffdfb]">
        <div className="page-shell py-20 lg:py-24">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <h2 className="section-title">Latest publications</h2>
            <Link href="/articles" className="inline-flex items-center gap-2 text-sm font-bold text-[#5f91a0] hover:underline">View all publications <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {researcherArticles.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {researcherArticles.slice(0, 3).map((article, index) => (
                <Link key={article.article_uuid} href={`/articles/${article.article_uuid}`}>
                  <article className="academic-card group flex min-h-[280px] flex-col p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,35,30,.1)]">
                    <div className="flex items-center justify-between"><span className="font-serif text-2xl font-bold text-slate-300">{String(index + 1).padStart(2, '0')}</span><ArrowUpRight className="h-5 w-5 text-slate-400 transition group-hover:text-[#5f91a0]" /></div>
                    {formatDate(article.published_at) && <p className="mt-8 text-xs font-medium text-slate-500">{formatDate(article.published_at)}</p>}
                    <h3 className="mt-3 font-serif text-2xl font-bold leading-8 tracking-[-0.02em] text-slate-900">{article.article_title}</h3>
                    <p className="mt-auto pt-8 text-xs font-semibold text-slate-500">{researcherName}</p>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="academic-card p-8 text-sm text-slate-500">No publications yet.</div>
          )}
        </div>
      </section>

      <section className="page-shell py-20 lg:py-28">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="overflow-hidden rounded-[32px] border border-[#d4e6ed] bg-[linear-gradient(135deg,#edf6ff_0%,#dff7f6_100%)] p-8 text-slate-900 shadow-sm sm:p-10 lg:p-12">
            <h2 className="max-w-3xl font-serif text-4xl font-bold tracking-[-0.035em] sm:text-5xl">Research resources</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">Documents and learning material shared through the research repository.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/repositories" className="inline-flex items-center gap-2 rounded-full bg-[#5f91a0] px-5 py-3 text-sm font-bold text-white hover:bg-[#4f8294]">Open repository <ArrowRight className="h-4 w-4" /></Link><Link href="/collaborators" className="inline-flex items-center gap-2 rounded-full border border-[#a9d7df] bg-[#fffdfb]/75 px-5 py-3 text-sm font-bold text-[#527b89]">Research network <Network className="h-4 w-4" /></Link></div>
          </div>
          <div className="academic-card p-8 sm:p-10 lg:p-12">
            <h2 className="font-serif text-3xl font-bold tracking-[-0.03em]">Contact {researcherName}</h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">For research collaboration, teaching, supervision, academic opportunities, or questions related to current work.</p>
            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#5f91a0] px-5 py-3 text-sm font-bold text-white hover:bg-[#4f8294]">Contact <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

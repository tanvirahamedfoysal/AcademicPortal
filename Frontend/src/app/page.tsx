import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  FileArchive,
  Network,
  Quote,
  Sparkles,
  UsersRound,
} from 'lucide-react';
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
  if (!value) return 'Recent publication';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent publication';
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
  const researchDescription = portfolio?.research_description?.trim() ||
    'Research centered on evidence, applied inquiry, academic mentoring, and the translation of scholarly work into useful learning and research outcomes.';

  return (
    <MainLayout>
      <ResearcherPortfolioHero portfolio={portfolio} media={media} articles={researcherArticles} />

      <section className="border-y border-slate-200 bg-[#fbfcfa]">
        <div className="page-shell grid gap-0 md:grid-cols-4">
          {[
            [researcherArticles.length, 'Published works', BookOpenText],
            [documents.length, 'Research resources', FileArchive],
            [collaborators.length, 'Collaborators', Network],
            [students.length, 'Learning community', UsersRound],
          ].map(([count, label, Icon], index) => (
            <div key={String(label)} className={`flex items-center gap-4 py-7 md:px-7 ${index > 0 ? 'border-t border-slate-200 md:border-l md:border-t-0' : ''}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e7efe9] text-[#0f3b34]"><Icon className="h-5 w-5" /></span>
              <div><p className="font-serif text-2xl font-bold text-slate-950">{count as number}</p><p className="mt-0.5 text-xs font-semibold text-slate-500">{label as string}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[.84fr_1.16fr] lg:gap-16">
          <div>
            <p className="eyebrow">Research agenda</p>
            <h2 className="section-title mt-4">The questions, methods, and themes behind {researcherName}&apos;s work.</h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">{researchDescription}</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {(interests.length ? interests : ['Research methods', 'Academic teaching', 'Evidence-led inquiry', 'Open scholarship']).slice(0, 10).map((interest) => (
                <span key={interest} className="rounded-full border border-emerald-900/10 bg-[#e7efe9] px-4 py-2 text-xs font-semibold text-[#18473f]">{interest}</span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="academic-card p-7 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8d6d2f]"><Sparkles className="h-3.5 w-3.5" /> Research practice</div>
              <h3 className="mt-6 font-serif text-2xl font-bold tracking-[-0.02em]">Scholarship connected to teaching.</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">The portfolio brings current research, published writing, academic resources, and learning activity together so students and research collaborators can follow the work in context.</p>
            </div>
            <div className="academic-card p-7 sm:p-8">
              <Quote className="h-8 w-8 text-[#c7a35c]" />
              <h3 className="mt-6 font-serif text-2xl font-bold tracking-[-0.02em]">A personal academic record, not a generic portal.</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">Every major public section now points back to {researcherName}&apos;s research identity, recent outputs, achievements, academic network, and resources.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="page-shell py-20 lg:py-24">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="eyebrow">Selected scholarship</p><h2 className="section-title mt-4">Latest published research</h2></div>
            <Link href="/articles" className="inline-flex items-center gap-2 text-sm font-bold text-[#0f3b34] hover:underline">View publication archive <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {(researcherArticles.length ? researcherArticles.slice(0, 3) : [
              { article_uuid: 'placeholder-1', article_title: 'Published research will appear here as it is released through the portal.', published_at: null },
              { article_uuid: 'placeholder-2', article_title: 'Research notes, journal papers, and scholarly writing remain connected to the researcher profile.', published_at: null },
              { article_uuid: 'placeholder-3', article_title: 'The publication archive is managed directly from the academic dashboard.', published_at: null },
            ]).map((article, index) => {
              const placeholder = article.article_uuid.startsWith('placeholder-');
              const content = (
                <article className="academic-card group flex min-h-[280px] flex-col p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,35,30,.1)]">
                  <div className="flex items-center justify-between"><span className="font-serif text-2xl font-bold text-slate-300">{String(index + 1).padStart(2, '0')}</span>{!placeholder && <ArrowUpRight className="h-5 w-5 text-slate-400 transition group-hover:text-[#0f3b34]" />}</div>
                  <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">{formatDate(article.published_at)}</p>
                  <h3 className="mt-3 font-serif text-2xl font-bold leading-8 tracking-[-0.02em] text-slate-900">{article.article_title}</h3>
                  <p className="mt-auto pt-8 text-xs font-semibold text-slate-500">{researcherName} · Research publication</p>
                </article>
              );
              return placeholder ? <div key={article.article_uuid}>{content}</div> : <Link key={article.article_uuid} href={`/articles/${article.article_uuid}`}>{content}</Link>;
            })}
          </div>
        </div>
      </section>

      <section className="page-shell py-20 lg:py-28">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="overflow-hidden rounded-[32px] bg-[#143b34] p-8 text-white sm:p-10 lg:p-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e6c27a]">Open academic resources</p>
            <h2 className="mt-5 max-w-3xl font-serif text-4xl font-bold tracking-[-0.035em] sm:text-5xl">Research material shared for students, collaborators, and fellow scholars.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/70">Browse documents and learning material uploaded through the research repository.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/repositories" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#153b35]">Open repository <ArrowRight className="h-4 w-4" /></Link><Link href="/collaborators" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white">Research network <Network className="h-4 w-4" /></Link></div>
          </div>
          <div className="academic-card p-8 sm:p-10 lg:p-12">
            <p className="eyebrow">Academic connection</p>
            <h2 className="mt-5 font-serif text-3xl font-bold tracking-[-0.03em]">Discuss research, teaching, supervision, or collaboration.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">Use the contact channel for academic opportunities, research collaboration, scholarly exchange, or questions related to {researcherName}&apos;s work.</p>
            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0f3b34] px-5 py-3 text-sm font-bold text-white">Contact {researcherName} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  BookOpenText,
  Building2,
  CircleDot,
  FileArchive,
  Github,
  GraduationCap,
  Network,
  NotebookTabs,
  Orbit,
  Quote,
  Search,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import {
  getCollaborators,
  getPortfolio,
  getPublicArticles,
  getRepositoryDocuments,
  getStudents,
} from '../lib/public-api';

export const revalidate = 60;

function formatDate(value?: string | null) {
  if (!value) return 'Recent publication';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent publication';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
}

function safeUrl(value?: string | null) {
  if (!value) return null;
  return value.startsWith('http://') || value.startsWith('https://') ? value : null;
}

export default async function HomePage() {
  const [portfolio, articles, collaborators, students, documents] = await Promise.all([
    getPortfolio(),
    getPublicArticles(),
    getCollaborators(),
    getStudents(),
    getRepositoryDocuments(),
  ]);

  const interests = portfolio?.research_interests?.filter(Boolean) ?? [];
  const researchStatement = portfolio?.research_description ||
    'A research-led academic portfolio focused on rigorous inquiry, open knowledge, scholarly communication, and collaboration across disciplines.';
  const publicBio = portfolio?.public_bio ||
    'This portal brings research writing, shared resources, collaborators, and a growing academic community into one coherent space for learning and discovery.';

  const institution = [portfolio?.college, portfolio?.school].filter(Boolean).join(' · ');
  const scholarUrl = safeUrl(portfolio?.google_scholar_url);
  const githubUrl = safeUrl(portfolio?.github_url);
  const cvUrl = safeUrl(portfolio?.cv_url);

  return (
    <MainLayout>
      <section className="relative overflow-hidden bg-[#0b2823] text-white">
        <div className="absolute inset-0 opacity-35 soft-grid" />
        <div className="absolute -right-20 top-8 h-[420px] w-[420px] rounded-full border border-white/10" />
        <div className="absolute -right-5 top-24 h-[290px] w-[290px] rounded-full border border-[#e6c27a]/25" />
        <div className="page-shell relative grid min-h-[690px] items-center gap-14 py-20 lg:grid-cols-[1.18fr_.82fr] lg:py-24">
          <div className="max-w-4xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/7 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-50/90 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[#e6c27a]" />
              Research portfolio & academic learning environment
            </div>
            <h1 className="max-w-4xl font-serif text-5xl font-bold leading-[1.03] tracking-[-0.045em] sm:text-6xl lg:text-[78px]">
              Research made <span className="text-[#e6c27a]">visible, useful,</span> and connected.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-emerald-50/72 sm:text-xl">{researchStatement}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/articles" className="inline-flex items-center gap-2 rounded-full bg-[#f5f0df] px-6 py-3.5 text-sm font-bold text-[#17362f] transition hover:-translate-y-0.5 hover:bg-white">
                Explore publications <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/repositories" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
                Browse research resources <FileArchive className="h-4 w-4" />
              </Link>
              {cvUrl && (
                <a href={cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-3.5 text-sm font-semibold text-emerald-50/75 hover:text-white">
                  View academic CV <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>

            {institution && (
              <div className="mt-10 flex items-center gap-3 text-sm text-emerald-50/60">
                <Building2 className="h-4 w-4 text-[#e6c27a]" /> {institution}
              </div>
            )}
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:ml-auto">
            <div className="absolute -inset-5 rounded-[36px] border border-white/8" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-white/[.075] p-6 shadow-2xl backdrop-blur-md sm:p-8">
              <div className="mb-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e6c27a]">Research index</p>
                  <p className="mt-2 font-serif text-2xl font-bold">A living scholarly record</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><Orbit className="h-5 w-5" /></span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  [articles.length, 'Published works', BookOpenText],
                  [documents.length, 'Shared resources', FileArchive],
                  [collaborators.length, 'Collaborators', Network],
                  [students.length, 'Community members', UsersRound],
                ].map(([count, label, Icon]) => (
                  <div key={String(label)} className="rounded-2xl border border-white/10 bg-[#09231f]/55 p-5">
                    <Icon className="mb-5 h-5 w-5 text-[#e6c27a]" />
                    <p className="font-serif text-3xl font-bold">{count as number}</p>
                    <p className="mt-1 text-xs font-medium text-emerald-50/55">{label as string}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.055] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-50/55">Current research direction</p>
                    <p className="mt-1 text-sm font-semibold text-white">Evidence · methods · open scholarship</p>
                  </div>
                  <div className="flex -space-x-2">
                    {[0, 1, 2].map((i) => <span key={i} className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#163c35] bg-[#d7e5dc] text-[10px] font-bold text-[#163c35]">R{i + 1}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#fbfcfa]">
        <div className="page-shell grid gap-0 md:grid-cols-3">
          {[
            ['01', 'Publish with context', 'Research outputs are presented as an accessible body of work rather than a static list of files.'],
            ['02', 'Learn from the process', 'Resources, articles, and community access make the portfolio useful to students and fellow researchers.'],
            ['03', 'Build durable networks', 'Collaborators and contributors are visible alongside the work, reflecting how modern research is actually produced.'],
          ].map(([num, title, text], index) => (
            <div key={num} className={`py-9 md:px-8 ${index > 0 ? 'border-t border-slate-200 md:border-l md:border-t-0' : ''}`}>
              <p className="text-xs font-bold tracking-[0.18em] text-emerald-800">{num}</p>
              <h2 className="mt-3 font-serif text-xl font-bold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Research profile</p>
            <h2 className="section-title mt-4">A portfolio built around questions, not decoration.</h2>
            <p className="mt-6 prose-research">{publicBio}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {(interests.length ? interests : ['Research methods', 'Scholarly writing', 'Data-informed inquiry', 'Open knowledge']).slice(0, 8).map((interest) => (
                <span key={interest} className="rounded-full border border-emerald-900/10 bg-[#e7efe9] px-3.5 py-2 text-xs font-semibold text-[#18473f]">{interest}</span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
              {scholarUrl && <a href={scholarUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#0f3b34] hover:underline"><GraduationCap className="h-4 w-4" /> Google Scholar</a>}
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#0f3b34] hover:underline"><Github className="h-4 w-4" /> GitHub</a>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Search, title: 'Inquiry & discovery', text: 'Frame research questions, trace evidence, and identify meaningful gaps worth investigating.' },
              { icon: NotebookTabs, title: 'Methods & documentation', text: 'Keep scholarly reasoning, data, resources, and research artifacts discoverable and reusable.' },
              { icon: BookMarked, title: 'Publication & communication', text: 'Translate research into writing that can travel across journals, classrooms, and professional networks.' },
              { icon: Network, title: 'Collaboration & mentoring', text: 'Create a visible network around shared interests, supervised learning, and interdisciplinary work.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="academic-card min-h-[250px] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,35,30,0.09)]">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e7efe9] text-[#0f3b34]"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-8 font-serif text-2xl font-bold tracking-[-0.02em]">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="page-shell py-20 lg:py-24">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Selected scholarship</p>
              <h2 className="section-title mt-4">Recent publications</h2>
            </div>
            <Link href="/articles" className="inline-flex items-center gap-2 text-sm font-bold text-[#0f3b34] hover:underline">View all publications <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {(articles.length ? articles.slice(0, 5) : [
              { article_uuid: 'placeholder-1', article_title: 'Publication records will appear here as they are released through the portal.', published_at: null },
              { article_uuid: 'placeholder-2', article_title: 'Research notes, peer-reviewed work, and academic writing are organized in one searchable collection.', published_at: null },
              { article_uuid: 'placeholder-3', article_title: 'Each published item can open into a dedicated reading view with the full article body.', published_at: null },
            ]).map((article, index) => {
              const placeholder = article.article_uuid.startsWith('placeholder-');
              const row = (
                <div className="group grid gap-4 py-7 transition sm:grid-cols-[90px_1fr_auto] sm:items-center sm:gap-7">
                  <div className="font-serif text-2xl font-bold text-slate-300">{String(index + 1).padStart(2, '0')}</div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-800">{formatDate(article.published_at)}</p>
                    <h3 className="mt-2 max-w-4xl font-serif text-xl font-bold leading-7 tracking-[-0.015em] text-slate-900 group-hover:text-[#0f3b34] sm:text-2xl">{article.article_title}</h3>
                  </div>
                  {!placeholder && <ArrowUpRight className="hidden h-5 w-5 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0f3b34] sm:block" />}
                </div>
              );
              return placeholder ? <div key={article.article_uuid}>{row}</div> : <Link key={article.article_uuid} href={`/articles/${article.article_uuid}`}>{row}</Link>;
            })}
          </div>
        </div>
      </section>

      <section className="page-shell py-20 lg:py-28">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="overflow-hidden rounded-[30px] bg-[#153b35] p-8 text-white sm:p-10 lg:p-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e6c27a]">Research resources</p>
            <div className="mt-5 grid gap-10 md:grid-cols-[1fr_.75fr]">
              <div>
                <h2 className="font-serif text-4xl font-bold tracking-[-0.035em] sm:text-5xl">A practical archive for learning and reuse.</h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-emerald-50/70">Access shared documents, datasets, references, reports, and academic materials directly from the research repository.</p>
                <Link href="/repositories" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#153b35]">Open repository <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="space-y-3">
                {(documents.length ? documents.slice(0, 4) : [
                  { id: 'a', name: 'Research documents', url: '#' },
                  { id: 'b', name: 'Academic references', url: '#' },
                  { id: 'c', name: 'Learning resources', url: '#' },
                ]).map((document) => (
                  <div key={document.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10"><FileArchive className="h-4 w-4" /></span>
                    <p className="min-w-0 truncate text-sm font-semibold">{document.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="academic-card flex flex-col justify-between p-8 sm:p-10 lg:p-12">
            <div>
              <Quote className="h-9 w-9 text-[#c7a35c]" />
              <h2 className="mt-8 font-serif text-3xl font-bold tracking-[-0.03em]">A research portfolio should help someone understand the work before they read the CV.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-600">This portal is structured to make the research agenda, recent scholarship, resources, and academic network discoverable from the first visit.</p>
            </div>
            <div className="mt-10 flex items-center gap-3 border-t border-slate-200 pt-6 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <CircleDot className="h-4 w-4 text-emerald-700" /> Research-first information architecture
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e7efe9]">
        <div className="page-shell py-20 lg:py-24">
          <div className="grid items-end gap-10 lg:grid-cols-[.78fr_1.22fr]">
            <div>
              <p className="eyebrow">Academic network</p>
              <h2 className="section-title mt-4">Scholarship grows through people.</h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">Meet collaborators and community members connected to the portal, and discover the human network behind ongoing learning and research.</p>
              <div className="mt-7 flex gap-3">
                <Link href="/collaborators" className="rounded-full bg-[#0f3b34] px-5 py-3 text-sm font-bold text-white">Collaborators</Link>
                <Link href="/contributors" className="rounded-full border border-emerald-950/15 bg-white/60 px-5 py-3 text-sm font-bold text-[#0f3b34]">Community</Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {collaborators.slice(0, 3).map((person) => (
                <div key={String(person.uuid)} className="rounded-[22px] border border-emerald-950/10 bg-white/80 p-5">
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-[#153b35] font-serif text-sm font-bold text-white">{person.name.slice(0, 2).toUpperCase()}</div>
                  <p className="font-serif text-lg font-bold">{person.name}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">Research collaborator</p>
                </div>
              ))}
              {collaborators.length === 0 && (
                <div className="sm:col-span-2 xl:col-span-3 rounded-[22px] border border-emerald-950/10 bg-white/80 p-7 text-sm leading-7 text-slate-600">Collaborator profiles published through the portal will appear here automatically.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-20 lg:py-28">
        <div className="relative overflow-hidden rounded-[34px] bg-[#0b2823] px-7 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
          <div className="absolute right-0 top-0 h-full w-2/5 opacity-20 soft-grid" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e6c27a]">Start a conversation</p>
              <h2 className="mt-4 max-w-3xl font-serif text-4xl font-bold tracking-[-0.035em] sm:text-5xl">Have a research question, collaboration idea, or academic opportunity?</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/65">Use the contact channel to discuss research collaboration, supervision, publications, learning resources, or academic partnerships.</p>
            </div>
            <Link href="/contact" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f5f0df] px-6 py-3.5 text-sm font-bold text-[#0f3b34]">Contact researcher <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

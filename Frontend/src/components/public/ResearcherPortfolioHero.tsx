'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  AtSign,
  BadgeCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Facebook,
  FileText,
  FlaskConical,
  Github,
  GraduationCap,
  Instagram,
  Linkedin,
  MessageCircle,
  X,
} from 'lucide-react';
import type { PortfolioData, PublicArticleSummary } from '../../types/public';
import type { PortfolioCustomSectionItem, PortfolioMedia, PortfolioQuickInfoItem } from '../../lib/portfolio-media';
import { resolvePortfolioQuickInfo } from '../../lib/portfolio-media';

interface ResearcherPortfolioHeroProps {
  portfolio: PortfolioData | null;
  media: PortfolioMedia;
  articles: PublicArticleSummary[];
}

function safeUrl(value?: string | null) {
  if (!value) return null;
  return value.startsWith('http://') || value.startsWith('https://') ? value : null;
}

function formatDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
}

function QuickInfoValue({ item }: { item: PortfolioQuickInfoItem }) {
  const value = item.value;
  if (item.source === 'email') {
    return <a href={`mailto:${value}`} className="break-all hover:text-[#4f8294]">{value}</a>;
  }
  if (item.source === 'phone') {
    return <a href={`tel:${value}`} className="break-all hover:text-[#4f8294]">{value}</a>;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return <a href={value} target="_blank" rel="noreferrer" className="break-all hover:text-[#4f8294]">{value}</a>;
  }
  return <span className="break-words">{value}</span>;
}

export default function ResearcherPortfolioHero({ portfolio, media, articles }: ResearcherPortfolioHeroProps) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeCustomItem, setActiveCustomItem] = useState<PortfolioCustomSectionItem | null>(null);
  const gallery = media.gallery;

  useEffect(() => {
    if (gallery.length <= 1) return;
    const timer = window.setInterval(() => {
      setActivePhoto((current) => (current + 1) % gallery.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [gallery.length]);

  useEffect(() => {
    if (activePhoto >= gallery.length) setActivePhoto(0);
  }, [activePhoto, gallery.length]);

  useEffect(() => {
    if (!activeCustomItem) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveCustomItem(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [activeCustomItem]);

  const currentPhoto = gallery[activePhoto] ?? null;

  const socialLinks = useMemo(
    () => [
      { label: 'Google Scholar', href: safeUrl(portfolio?.google_scholar_url), icon: GraduationCap },
      { label: 'ResearchGate', href: safeUrl(portfolio?.researchgate_url), icon: FlaskConical },
      { label: 'ORCID', href: safeUrl(portfolio?.orcid_url), icon: BadgeCheck },
      { label: 'GitHub', href: safeUrl(portfolio?.github_url), icon: Github },
      { label: 'LinkedIn', href: safeUrl(portfolio?.linkedin_url), icon: Linkedin },
      { label: 'X / Twitter', href: safeUrl(portfolio?.x_url), icon: AtSign },
      { label: 'Instagram', href: safeUrl(portfolio?.instagram_url), icon: Instagram },
      { label: 'Facebook', href: safeUrl(portfolio?.facebook_url), icon: Facebook },
      { label: 'Discord', href: safeUrl(portfolio?.discord_url), icon: MessageCircle },
    ].filter((item) => Boolean(item.href)),
    [portfolio],
  );

  const recentArticles = articles.slice(0, 6);
  const customSection = media.customSection;
  const fullName = media.researcherInfo.fullName || 'Dr. Tania Islam';
  const occupation = media.researcherInfo.occupation || '';
  const designation = media.researcherInfo.designation || '';
  const aboutMe = portfolio?.public_bio?.trim() || '';
  const quickInfo = resolvePortfolioQuickInfo(portfolio, media);

  const goPrevious = () => {
    if (!gallery.length) return;
    setActivePhoto((current) => (current - 1 + gallery.length) % gallery.length);
  };

  const goNext = () => {
    if (!gallery.length) return;
    setActivePhoto((current) => (current + 1) % gallery.length);
  };

  return (
    <section className="relative overflow-hidden border-b border-[#d9e8ef] bg-[#fffaf7] text-slate-900">
      <div className="absolute inset-0 soft-grid opacity-55" />
      <div className="absolute -right-32 -top-28 h-[520px] w-[520px] rounded-full bg-[#dff7f6]/65 blur-2xl" />
      <div className="absolute -left-32 bottom-0 h-[440px] w-[440px] rounded-full bg-[#edf6ff]/80 blur-2xl" />

      <div className="relative mx-auto grid w-full max-w-[1740px] gap-4 px-3 py-4 sm:px-5 sm:py-5 lg:grid-cols-[72px_270px_minmax(0,1fr)_330px] lg:gap-5 lg:px-6 lg:py-7 2xl:grid-cols-[76px_300px_minmax(0,1fr)_360px]">
        <aside className="order-1 min-w-0 rounded-[24px] border border-[#d7e7ee] bg-[#edf6ff]/90 p-2.5 shadow-[0_12px_35px_rgba(83,111,137,.08)] backdrop-blur-sm lg:row-span-2">
          <div className="flex h-full min-w-0 items-center gap-2 overflow-x-auto pb-1 lg:flex-col lg:justify-start lg:overflow-visible lg:pb-0">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href!}
                target="_blank"
                rel="noreferrer"
                title={label}
                aria-label={label}
                className="group relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#cde3ea] bg-[#fffdfb] text-[#547a8b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#a9d7df] hover:bg-[#dff7f6] hover:text-[#3f7081]"
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="pointer-events-none absolute left-[52px] z-20 hidden whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xl group-hover:lg:block">{label}</span>
              </a>
            ))}
          </div>
        </aside>

        <div className="order-2 min-w-0 space-y-4 lg:row-span-2">
          <section className="relative min-h-[330px] overflow-hidden rounded-[28px] border border-[#d6e7ef] bg-[linear-gradient(145deg,#edf6ff,#dff7f6)] shadow-[0_18px_48px_rgba(78,106,131,.10)] sm:min-h-[420px] lg:min-h-[355px]">
            {media.portfolioPhoto ? (
              <img src={media.portfolioPhoto} alt={`${fullName} portfolio`} className="absolute inset-0 h-full w-full object-contain p-2 sm:p-3 lg:object-cover lg:p-0" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_25%,rgba(223,247,246,.88),transparent_42%),linear-gradient(145deg,#edf6ff,#dff7f6)] px-7 text-center">
                <div className="grid h-24 w-24 place-items-center rounded-full border border-[#b8dce3] bg-[#fffdfb]/90 font-serif text-4xl font-bold text-[#527f8f]">TI</div>
                <p className="mt-5 text-sm font-semibold text-slate-700">Portfolio photo</p>
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-[#d7e7ee] bg-[#edf6ff]/72 p-5 shadow-[0_14px_40px_rgba(85,125,137,.06)] backdrop-blur-sm">
            <h1 className="break-words font-serif text-3xl font-bold tracking-[-0.03em] text-slate-900">{fullName}</h1>
            {(occupation || designation) && <p className="mt-1.5 text-sm font-semibold text-slate-600">{[occupation, designation].filter(Boolean).join(' · ')}</p>}
            {quickInfo.length > 0 && (
              <dl className="mt-5 divide-y divide-[#d7e7ee] text-sm text-slate-600">
                {quickInfo.map((item) => (
                  <div key={item.id} className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[118px_minmax(0,1fr)] lg:grid-cols-1 2xl:grid-cols-[118px_minmax(0,1fr)]">
                    <dt className="font-semibold text-slate-500">{item.label}</dt>
                    <dd className="min-w-0 text-slate-700"><QuickInfoValue item={item} /></dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        </div>

        <div className="order-3 min-w-0 space-y-4">
          <section className="rounded-[30px] border border-[#cfe8eb] bg-[#dff7f6]/70 p-5 shadow-[0_14px_40px_rgba(85,125,137,.06)] backdrop-blur-sm sm:p-7 lg:min-h-[355px]">
            <div className="flex items-start justify-between gap-4">
              <h2 className="break-words font-serif text-3xl font-bold tracking-[-0.025em] text-slate-900">About me</h2>
              <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#cde3ea] bg-[#fffdfb]/80 text-[#527f8f] sm:grid"><BookOpen className="h-5 w-5" /></span>
            </div>
            {aboutMe ? <p className="mt-6 max-w-4xl whitespace-pre-line text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8">{aboutMe}</p> : <p className="mt-6 text-sm text-slate-500">Biography not added yet.</p>}
            <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <Link href="/articles" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5f91a0] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#4f8294]">View publications <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              {safeUrl(portfolio?.cv_url) && <a href={safeUrl(portfolio?.cv_url)!} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#bcdfe5] bg-[#fffdfb]/85 px-4 py-2.5 text-xs font-bold text-[#55798a] transition hover:bg-[#edf6ff]">Academic CV <ExternalLink className="h-3.5 w-3.5" /></a>}
            </div>
          </section>

          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(250px,.85fr)]">
            <section className="relative min-h-[300px] overflow-hidden rounded-[30px] border border-[#d4e5ed] bg-[#edf6ff] sm:min-h-[390px]">
              {currentPhoto ? (
                <img
                  key={`${currentPhoto.id}-${activePhoto}`}
                  src={currentPhoto.url}
                  alt={currentPhoto.description || `${fullName} gallery image ${activePhoto + 1}`}
                  className="portfolio-slide-enter absolute inset-0 h-full w-full object-contain p-2 sm:p-4 xl:object-cover xl:p-0"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center px-7 text-center">
                  <p className="font-serif text-xl font-semibold text-slate-500">No gallery photos yet.</p>
                </div>
              )}
              {gallery.length > 0 && (
                <>
                  <div className="absolute bottom-4 left-3 z-20 flex max-w-[55%] flex-wrap gap-1.5 rounded-full bg-[#fffdfb]/88 px-2.5 py-2 shadow-sm backdrop-blur sm:bottom-5 sm:left-5 sm:gap-2">
                    {gallery.map((photo, index) => (
                      <button key={photo.id} onClick={() => setActivePhoto(index)} aria-label={`Show gallery image ${index + 1}`} className={`h-2 rounded-full transition-all ${index === activePhoto ? 'w-7 bg-[#5f91a0]' : 'w-2 bg-[#9fcbd3] hover:bg-[#77b4bf]'}`} />
                    ))}
                  </div>
                  <div className="absolute bottom-3 right-3 z-20 flex gap-2 sm:bottom-4 sm:right-4">
                    <button onClick={goPrevious} className="grid h-10 w-10 place-items-center rounded-full border border-[#c9dfe8] bg-[#fffdfb]/92 text-slate-700 shadow-sm backdrop-blur transition hover:bg-[#edf6ff]" aria-label="Previous gallery image"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={goNext} className="grid h-10 w-10 place-items-center rounded-full border border-[#c9dfe8] bg-[#fffdfb]/92 text-slate-700 shadow-sm backdrop-blur transition hover:bg-[#dff7f6]" aria-label="Next gallery image"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </>
              )}
            </section>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <section className="rounded-[28px] border border-[#d7e7ee] bg-[#edf6ff]/70 p-5 shadow-sm sm:p-6">
                <h3 className="font-serif text-lg font-semibold text-slate-900">Description</h3>
                <p className="mt-4 min-w-0 whitespace-pre-line break-words text-sm leading-7 text-slate-600">{currentPhoto?.description || '—'}</p>
              </section>
              <section className="rounded-[28px] border border-[#cfe8eb] bg-[#dff7f6]/60 p-5 shadow-sm sm:p-6">
                <h3 className="font-serif text-lg font-semibold text-slate-900">Links</h3>
                <div className="mt-4 space-y-2">
                  {currentPhoto?.links?.length ? currentPhoto.links.map((href, index) => (
                    <a key={`${href}-${index}`} href={href} target="_blank" rel="noreferrer" className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-[#cde2e8] bg-[#fffdfb]/86 px-3 py-3 text-xs font-semibold text-slate-600 transition hover:border-[#a9d7df] hover:text-[#4f8294]">
                      <span className="min-w-0 truncate">Link {index + 1}</span><ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#5f91a0]" />
                    </a>
                  )) : <p className="text-sm text-slate-500">—</p>}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="order-4 grid min-w-0 gap-4 lg:row-span-2 lg:grid-rows-2">
          <section className="flex min-h-0 flex-col rounded-[30px] border border-[#d7e6ee] bg-[#fffdfb]/94 p-5 shadow-[0_18px_52px_rgba(83,111,137,.08)] backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-[#dce7ee] pb-4">
              <h2 className="break-words font-serif text-2xl font-bold tracking-[-0.02em] text-slate-900">Recent publications</h2>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#edf6ff] text-[#5e93a0]"><FileText className="h-[18px] w-[18px]" /></span>
            </div>

            <div className="mt-1 min-h-0 flex-1 divide-y divide-[#e1eaf0] lg:overflow-y-auto lg:pr-1">
              {recentArticles.length ? recentArticles.map((article, index) => (
                <Link key={article.article_uuid} href={`/articles/${article.article_uuid}`} className="group block py-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 font-serif text-base font-bold text-[#b5c9d4]">{String(index + 1).padStart(2, '0')}</span>
                    <div className="min-w-0 flex-1">
                      {formatDate(article.published_at) && <p className="text-[11px] font-medium text-slate-500">{formatDate(article.published_at)}</p>}
                      <h3 className="mt-1 break-words font-serif text-[16px] font-semibold leading-6 text-slate-800 transition group-hover:text-[#4f8294]">{article.article_title}</h3>
                    </div>
                    <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-[#5e93a0]" />
                  </div>
                </Link>
              )) : (
                <div className="py-7 text-sm text-slate-500">No publications yet.</div>
              )}
            </div>

            <Link href="/articles" className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#b8dce3] bg-[#edf6ff] px-4 py-3 text-xs font-bold text-[#4f8294] transition hover:bg-[#dff7f6]">
              View all publications <ArrowUpRight className="h-4 w-4 shrink-0" />
            </Link>
          </section>

          <section className="flex min-h-0 flex-col rounded-[30px] border border-[#cfe8eb] bg-[#dff7f6]/52 p-5 shadow-[0_18px_52px_rgba(83,111,137,.07)] backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-[#d4e7ec] pb-4">
              <h2 className="break-words font-serif text-2xl font-bold tracking-[-0.02em] text-slate-900">{customSection.header || 'Custom section'}</h2>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#fffdfb]/86 text-[#5e93a0]"><BookOpen className="h-[18px] w-[18px]" /></span>
            </div>

            <div className="mt-1 min-h-0 flex-1 divide-y divide-[#d7e7eb] lg:overflow-y-auto lg:pr-1">
              {customSection.items.length ? customSection.items.map((item, index) => {
                const hasDescription = Boolean(item.description.trim());
                const hasLink = Boolean(safeUrl(item.link));
                const row = (
                  <div className="flex items-start gap-3 py-4 text-left">
                    <span className="mt-0.5 shrink-0 font-serif text-base font-bold text-[#9fbfc8]">{String(index + 1).padStart(2, '0')}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-serif text-[16px] font-semibold leading-6 text-slate-800 transition group-hover:text-[#4f8294]">{item.name}</h3>
                      {hasDescription && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>}
                    </div>
                    {(hasDescription || hasLink) && <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-[#5e93a0]" />}
                  </div>
                );

                if (!hasDescription && hasLink) {
                  return <a key={item.id} href={item.link} target="_blank" rel="noreferrer" className="group block">{row}</a>;
                }

                if (hasDescription) {
                  return <button key={item.id} type="button" onClick={() => setActiveCustomItem(item)} className="group block w-full">{row}</button>;
                }

                return <div key={item.id}>{row}</div>;
              }) : (
                <div className="py-7 text-sm text-slate-500">No items yet.</div>
              )}
            </div>
          </section>
        </div>
      </div>

      {activeCustomItem && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm" onMouseDown={() => setActiveCustomItem(null)}>
          <article className="max-h-[min(78vh,720px)] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-[#d4e5ed] bg-[#fffdfb] p-5 shadow-[0_30px_90px_rgba(15,35,50,.22)] sm:p-7" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-5">
              <h2 className="break-words font-serif text-2xl font-bold tracking-[-0.025em] text-slate-900 sm:text-3xl">{activeCustomItem.name}</h2>
              <button type="button" onClick={() => setActiveCustomItem(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d5e5ec] bg-[#edf6ff] text-slate-600 transition hover:bg-[#dff7f6]" aria-label="Close details"><X className="h-4 w-4" /></button>
            </div>

            {activeCustomItem.description && <p className="mt-6 whitespace-pre-line break-words text-sm leading-7 text-slate-600 sm:text-[15px] sm:leading-8">{activeCustomItem.description}</p>}

            {safeUrl(activeCustomItem.link) && (
              <a href={activeCustomItem.link} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#5f91a0] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4f8294]">
                Open link <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </article>
        </div>
      )}
    </section>
  );
}

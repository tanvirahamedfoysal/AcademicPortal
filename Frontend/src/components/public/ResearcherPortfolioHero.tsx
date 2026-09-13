'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  AtSign,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Facebook,
  FileText,
  FlaskConical,
  Github,
  GraduationCap,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  UserRound,
} from 'lucide-react';
import type { PortfolioData, PublicArticleSummary } from '../../types/public';
import type { PortfolioMedia } from '../../lib/portfolio-media';

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
  if (!value) return 'Published';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Published';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
}

export default function ResearcherPortfolioHero({ portfolio, media, articles }: ResearcherPortfolioHeroProps) {
  const [activePhoto, setActivePhoto] = useState(0);
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

  const recentArticles = articles.slice(0, 8);
  const fullName = media.researcherInfo.fullName || 'Dr. Tania Islam';
  const occupation = media.researcherInfo.occupation || 'Academic Researcher & Educator';
  const designation = media.researcherInfo.designation || 'Assistant Professor';
  const education = media.researcherInfo.education || portfolio?.school?.trim() || portfolio?.college?.trim() || 'Academic background available in CV';
  const aboutMe = portfolio?.public_bio?.trim() ||
    `${fullName} is an academic researcher and assistant professor whose work connects rigorous inquiry, teaching, scholarly communication, and collaborative learning.`;
  const institution = portfolio?.college?.trim() || 'Academic institution';

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
      <div className="absolute -right-32 -top-28 h-[520px] w-[520px] rounded-full bg-[#dff7f6]/55 blur-2xl" />
      <div className="absolute -left-32 bottom-0 h-[440px] w-[440px] rounded-full bg-[#f8dce7]/55 blur-2xl" />

      <div className="relative mx-auto grid w-full max-w-[1740px] gap-4 px-3 py-4 sm:px-5 sm:py-5 lg:grid-cols-[72px_270px_minmax(0,1fr)_330px] lg:gap-5 lg:px-6 lg:py-7 2xl:grid-cols-[76px_300px_minmax(0,1fr)_360px]">
        <aside className="order-1 min-w-0 rounded-[24px] border border-[#d7e7ee] bg-[#edf6ff]/85 p-2.5 shadow-[0_12px_35px_rgba(83,111,137,.08)] backdrop-blur-sm lg:row-span-2">
          <div className="flex h-full min-w-0 items-center gap-2 overflow-x-auto pb-1 lg:flex-col lg:justify-start lg:overflow-visible lg:pb-0">
            <div className="hidden pb-1 pt-1 text-center lg:block">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9f5f7a] [writing-mode:vertical-rl]">Research profiles</span>
            </div>
            {socialLinks.length ? socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href!}
                target="_blank"
                rel="noreferrer"
                title={label}
                aria-label={label}
                className="group relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#cde3ea] bg-[#fffdfb] text-[#547a8b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#e3aec2] hover:bg-[#f8dce7] hover:text-[#8f516d]"
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="pointer-events-none absolute left-[52px] z-20 hidden whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xl group-hover:lg:block">{label}</span>
              </a>
            )) : (
              <div className="flex min-h-20 items-center justify-center px-2 text-center text-[11px] leading-5 text-slate-500 lg:min-h-0 lg:flex-1 lg:[writing-mode:vertical-rl]">
                Add researcher links from Portfolio Editor
              </div>
            )}
          </div>
        </aside>

        <div className="order-2 min-w-0 space-y-4 lg:row-span-2">
          <section className="relative min-h-[330px] overflow-hidden rounded-[28px] border border-[#d6e7ef] bg-[linear-gradient(145deg,#edf6ff,#dff7f6)] shadow-[0_18px_48px_rgba(78,106,131,.10)] sm:min-h-[420px] lg:min-h-[355px]">
            {media.portfolioPhoto ? (
              <img src={media.portfolioPhoto} alt={`${fullName} portfolio`} className="absolute inset-0 h-full w-full object-contain p-2 sm:p-3 lg:object-cover lg:p-0" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_25%,rgba(248,220,231,.85),transparent_42%),linear-gradient(145deg,#edf6ff,#dff7f6)] px-7 text-center">
                <div className="grid h-24 w-24 place-items-center rounded-full border border-[#e4b2c5] bg-[#fffdfb]/85 font-serif text-4xl font-bold text-[#9f5f7a]">TI</div>
                <p className="mt-5 text-sm font-semibold text-slate-700">Portfolio photo</p>
                <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">Upload a dedicated portrait from Admin → Necessary Photos.</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#fffaf7]/96 via-[#fffaf7]/72 to-transparent px-4 pb-4 pt-14 sm:px-5 sm:pb-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e7b9cb] bg-[#fffdfb]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9f5f7a] shadow-sm backdrop-blur">
                <Sparkles className="h-3 w-3" /> Researcher portfolio
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#ead8e1] bg-[#f8dce7]/58 p-5 shadow-[0_14px_40px_rgba(130,89,108,.06)] backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#9f5f7a]">Quick information</p>
            <h1 className="mt-3 break-words font-serif text-3xl font-bold tracking-[-0.03em] text-slate-900">{fullName}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-600">{occupation} · {designation}</p>
            <div className="mt-5 space-y-3.5 text-xs leading-5 text-slate-600">
              <div className="flex items-start gap-3"><UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#b96586]" /><div><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Occupation</span><span>{occupation}</span></div></div>
              <div className="flex items-start gap-3"><GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-[#6caebb]" /><div><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Education</span><span>{education}</span></div></div>
              <div className="flex items-start gap-3"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#b96586]" /><div><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Designation</span><span>{designation}{institution !== 'Academic institution' ? ` · ${institution}` : ''}</span></div></div>
              {portfolio?.phone && <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#6caebb]" /><div><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Phone</span><a href={`tel:${portfolio.phone}`} className="break-all hover:text-[#9f5f7a]">{portfolio.phone}</a></div></div>}
              {portfolio?.email && <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#b96586]" /><div className="min-w-0"><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Email</span><a href={`mailto:${portfolio.email}`} className="break-all hover:text-[#9f5f7a]">{portfolio.email}</a></div></div>}
            </div>
          </section>
        </div>

        <div className="order-3 min-w-0 space-y-4">
          <section className="rounded-[30px] border border-[#cfe8eb] bg-[#dff7f6]/65 p-5 shadow-[0_14px_40px_rgba(85,125,137,.06)] backdrop-blur-sm sm:p-7 lg:min-h-[355px]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5e93a0]">About me</p>
                <h2 className="mt-2 break-words font-serif text-3xl font-bold tracking-[-0.025em] text-slate-900">Research, teaching &amp; scholarly practice</h2>
              </div>
              <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#cde3ea] bg-[#fffdfb]/80 sm:grid"><BookOpen className="h-5 w-5 text-[#b96586]" /></span>
            </div>
            <p className="mt-6 max-w-4xl text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8">{aboutMe}</p>
            <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <Link href="/articles" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b96586] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#a65376]">View publications <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              {safeUrl(portfolio?.cv_url) && <a href={safeUrl(portfolio?.cv_url)!} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#bcdfe5] bg-[#fffdfb]/80 px-4 py-2.5 text-xs font-bold text-[#55798a] transition hover:bg-[#edf6ff]">Academic CV <ExternalLink className="h-3.5 w-3.5" /></a>}
            </div>
          </section>

          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(250px,.85fr)]">
            <section className="relative min-h-[300px] overflow-hidden rounded-[30px] border border-[#d4e5ed] bg-[#edf6ff] sm:min-h-[390px]">
              <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full border border-[#e4c0cf] bg-[#fffdfb]/92 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.13em] text-[#9f5f7a] shadow-sm backdrop-blur sm:left-5 sm:top-5 sm:text-[10px] sm:tracking-[0.17em]">
                <ImageIcon className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Achievements &amp; photo gallery</span>
              </div>
              {currentPhoto ? (
                <img
                  key={`${currentPhoto.id}-${activePhoto}`}
                  src={currentPhoto.url}
                  alt={currentPhoto.description || `${fullName} achievement ${activePhoto + 1}`}
                  className="portfolio-slide-enter absolute inset-0 h-full w-full object-contain p-2 pt-14 sm:p-4 sm:pt-16 xl:object-cover xl:p-0"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-7 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#cfe2eb] bg-[#fffdfb]"><ImageIcon className="h-7 w-7 text-[#7ca5b4]" /></div>
                  <p className="mt-5 font-serif text-2xl font-bold text-slate-900">Achievement gallery</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Photos added from Admin → Necessary Photos will slide through this gallery automatically.</p>
                </div>
              )}
              {gallery.length > 0 && (
                <>
                  <div className="absolute bottom-4 left-3 z-20 flex max-w-[55%] flex-wrap gap-1.5 rounded-full bg-[#fffdfb]/86 px-2.5 py-2 shadow-sm backdrop-blur sm:bottom-5 sm:left-5 sm:gap-2">
                    {gallery.map((photo, index) => (
                      <button key={photo.id} onClick={() => setActivePhoto(index)} aria-label={`Show gallery image ${index + 1}`} className={`h-2 rounded-full transition-all ${index === activePhoto ? 'w-7 bg-[#b96586]' : 'w-2 bg-[#9fcbd3] hover:bg-[#77b4bf]'}`} />
                    ))}
                  </div>
                  <div className="absolute bottom-3 right-3 z-20 flex gap-2 sm:bottom-4 sm:right-4">
                    <button onClick={goPrevious} className="grid h-10 w-10 place-items-center rounded-full border border-[#c9dfe8] bg-[#fffdfb]/92 text-slate-700 shadow-sm backdrop-blur transition hover:bg-[#f8dce7]" aria-label="Previous gallery image"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={goNext} className="grid h-10 w-10 place-items-center rounded-full border border-[#c9dfe8] bg-[#fffdfb]/92 text-slate-700 shadow-sm backdrop-blur transition hover:bg-[#dff7f6]" aria-label="Next gallery image"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </>
              )}
            </section>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <section className="rounded-[28px] border border-[#ead8e1] bg-[#f8dce7]/55 p-5 shadow-sm sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9f5f7a]">Photo story</p>
                <div className="mt-4 flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fffdfb] text-[#b96586] shadow-sm"><CalendarDays className="h-4 w-4" /></span>
                  <p className="min-w-0 break-words text-sm leading-7 text-slate-600">{currentPhoto?.description || 'Select a gallery photo to read the achievement, event, research milestone, or context connected to it.'}</p>
                </div>
              </section>
              <section className="rounded-[28px] border border-[#cfe8eb] bg-[#dff7f6]/55 p-5 shadow-sm sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5e93a0]">Related links</p>
                <div className="mt-4 space-y-2">
                  {currentPhoto?.links?.length ? currentPhoto.links.map((href, index) => (
                    <a key={`${href}-${index}`} href={href} target="_blank" rel="noreferrer" className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-[#cde2e8] bg-[#fffdfb]/82 px-3 py-3 text-xs font-semibold text-slate-600 transition hover:border-[#e4b2c5] hover:text-[#9f5f7a]">
                      <span className="min-w-0 truncate">Related source {index + 1}</span><ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#b96586]" />
                    </a>
                  )) : <p className="text-xs leading-6 text-slate-500">No related link has been added for this photo.</p>}
                </div>
              </section>
            </div>
          </div>
        </div>

        <aside className="order-4 min-w-0 rounded-[30px] border border-[#d7e6ee] bg-[#fffdfb]/92 p-5 shadow-[0_18px_52px_rgba(83,111,137,.08)] backdrop-blur-sm sm:p-6 lg:row-span-2">
          <div className="flex items-start justify-between gap-4 border-b border-[#dce7ee] pb-5">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9f5f7a]">Recent research</p>
              <h2 className="mt-2 break-words font-serif text-2xl font-bold tracking-[-0.02em] text-slate-900">Papers &amp; publications</h2>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#edf6ff] text-[#5e93a0]"><FileText className="h-4.5 w-4.5" /></span>
          </div>

          <div className="mt-2 divide-y divide-[#e1eaf0] lg:max-h-[760px] lg:overflow-y-auto lg:pr-1">
            {recentArticles.length ? recentArticles.map((article, index) => (
              <Link key={article.article_uuid} href={`/articles/${article.article_uuid}`} className="group block py-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 font-serif text-lg font-bold text-[#b5c9d4]">{String(index + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#9f5f7a]">{formatDate(article.published_at)}</p>
                    <h3 className="mt-2 break-words font-serif text-[17px] font-semibold leading-6 text-slate-800 transition group-hover:text-[#9f5f7a]">{article.article_title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition group-hover:text-[#5e93a0]">Read paper <ArrowUpRight className="h-3 w-3" /></span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="py-8 text-sm leading-7 text-slate-500">Published papers added from the dashboard will automatically appear here.</div>
            )}
          </div>

          <Link href="/articles" className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-[#e4b2c5] bg-[#f8dce7]/68 px-4 py-3.5 text-xs font-bold text-[#8d506b] transition hover:bg-[#f2c9d9]">
            Browse all publications <ArrowUpRight className="h-4 w-4 shrink-0" />
          </Link>
        </aside>
      </div>
    </section>
  );
}

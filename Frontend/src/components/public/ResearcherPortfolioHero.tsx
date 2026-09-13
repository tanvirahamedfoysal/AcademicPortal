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
    <section className="relative overflow-hidden bg-[#0a2a24] text-white">
      <div className="absolute inset-0 opacity-25 soft-grid" />
      <div className="absolute -right-28 -top-28 h-[520px] w-[520px] rounded-full border border-white/5" />
      <div className="absolute right-8 top-24 h-[340px] w-[340px] rounded-full border border-[#d6b66f]/10" />

      <div className="relative mx-auto grid w-full max-w-[1740px] gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[72px_270px_minmax(0,1fr)_330px] lg:gap-5 lg:px-6 lg:py-7 2xl:grid-cols-[76px_300px_minmax(0,1fr)_360px]">
        <aside className="order-1 rounded-[26px] border border-white/10 bg-white/[.045] p-2.5 backdrop-blur-sm lg:row-span-2">
          <div className="flex h-full items-center gap-2 overflow-x-auto lg:flex-col lg:justify-start lg:overflow-visible">
            <div className="hidden pb-1 pt-1 text-center lg:block">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#e6c27a] [writing-mode:vertical-rl]">Research profiles</span>
            </div>
            {socialLinks.length ? socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href!}
                target="_blank"
                rel="noreferrer"
                title={label}
                aria-label={label}
                className="group relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[.07] text-emerald-50/75 transition hover:-translate-y-0.5 hover:border-[#e6c27a]/45 hover:bg-[#e6c27a] hover:text-[#12352e]"
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="pointer-events-none absolute left-[52px] z-20 hidden whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#12352e] shadow-xl group-hover:lg:block">{label}</span>
              </a>
            )) : (
              <div className="flex min-h-32 items-center justify-center px-2 text-center text-[11px] leading-5 text-emerald-50/45 lg:min-h-0 lg:flex-1 lg:[writing-mode:vertical-rl]">
                Add researcher links from Portfolio Editor
              </div>
            )}
          </div>
        </aside>

        <div className="order-2 space-y-4 lg:row-span-2">
          <section className="relative min-h-[355px] overflow-hidden rounded-[28px] border border-white/12 bg-[#123b34] shadow-[0_20px_55px_rgba(0,0,0,.2)]">
            {media.portfolioPhoto ? (
              <img src={media.portfolioPhoto} alt={`${fullName} portfolio`} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_25%,rgba(230,194,122,.16),transparent_38%),linear-gradient(145deg,#17483f,#0d302a)] px-8 text-center">
                <div className="grid h-24 w-24 place-items-center rounded-full border border-[#e6c27a]/35 bg-white/[.06] font-serif text-4xl font-bold text-[#f3dfad]">TI</div>
                <p className="mt-5 text-sm font-semibold text-emerald-50/80">Portfolio photo</p>
                <p className="mt-2 text-xs leading-5 text-emerald-50/45">Upload a dedicated portrait from Admin → Necessary Photos.</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#061a16]/95 via-[#061a16]/55 to-transparent px-5 pb-5 pt-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#edd08d] backdrop-blur">
                <Sparkles className="h-3 w-3" /> Researcher portfolio
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[.055] p-5 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#e6c27a]">Quick information</p>
            <h1 className="mt-3 font-serif text-3xl font-bold tracking-[-0.03em]">{fullName}</h1>
            <p className="mt-1 text-sm font-semibold text-emerald-50/70">{occupation} · {designation}</p>
            <div className="mt-5 space-y-3.5 text-xs leading-5 text-emerald-50/72">
              <div className="flex items-start gap-3"><UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#e6c27a]" /><div><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-50/35">Occupation</span><span>{occupation}</span></div></div>
              <div className="flex items-start gap-3"><GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-[#e6c27a]" /><div><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-50/35">Education</span><span>{education}</span></div></div>
              <div className="flex items-start gap-3"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#e6c27a]" /><div><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-50/35">Designation</span><span>{designation}{institution !== 'Academic institution' ? ` · ${institution}` : ''}</span></div></div>
              {portfolio?.phone && <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#e6c27a]" /><div><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-50/35">Phone</span><a href={`tel:${portfolio.phone}`} className="hover:text-white">{portfolio.phone}</a></div></div>}
              {portfolio?.email && <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#e6c27a]" /><div className="min-w-0"><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-50/35">Email</span><a href={`mailto:${portfolio.email}`} className="break-all hover:text-white">{portfolio.email}</a></div></div>}
            </div>
          </section>
        </div>

        <div className="order-3 space-y-4">
          <section className="rounded-[30px] border border-white/10 bg-white/[.055] p-6 backdrop-blur-sm sm:p-7 lg:min-h-[355px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c27a]">About me</p>
                <h2 className="mt-2 font-serif text-3xl font-bold tracking-[-0.025em]">Research, teaching &amp; scholarly practice</h2>
              </div>
              <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.06] sm:grid"><BookOpen className="h-5 w-5 text-[#e6c27a]" /></span>
            </div>
            <p className="mt-6 max-w-4xl text-[15px] leading-7 text-emerald-50/72 sm:text-base sm:leading-8">{aboutMe}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/articles" className="inline-flex items-center gap-2 rounded-full bg-[#f6f0dc] px-4 py-2.5 text-xs font-bold text-[#153c34] transition hover:bg-white">View publications <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              {safeUrl(portfolio?.cv_url) && <a href={safeUrl(portfolio?.cv_url)!} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10">Academic CV <ExternalLink className="h-3.5 w-3.5" /></a>}
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(250px,.85fr)]">
            <section className="relative min-h-[390px] overflow-hidden rounded-[30px] border border-white/10 bg-[#071f1b]">
              <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/12 bg-[#071f1b]/75 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#e6c27a] backdrop-blur">
                <ImageIcon className="h-3.5 w-3.5" /> Achievements &amp; photo gallery
              </div>
              {currentPhoto ? (
                <img
                  key={`${currentPhoto.id}-${activePhoto}`}
                  src={currentPhoto.url}
                  alt={currentPhoto.description || `${fullName} achievement ${activePhoto + 1}`}
                  className="portfolio-slide-enter absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[.05]"><ImageIcon className="h-7 w-7 text-emerald-50/45" /></div>
                  <p className="mt-5 font-serif text-2xl font-bold">Achievement gallery</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-emerald-50/48">Photos added from Admin → Necessary Photos will slide through this gallery automatically.</p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#041511]/80 via-transparent to-black/10" />
              {gallery.length > 0 && (
                <>
                  <div className="absolute bottom-5 left-5 z-20 flex gap-2">
                    {gallery.map((photo, index) => (
                      <button key={photo.id} onClick={() => setActivePhoto(index)} aria-label={`Show gallery image ${index + 1}`} className={`h-2 rounded-full transition-all ${index === activePhoto ? 'w-7 bg-[#e6c27a]' : 'w-2 bg-white/45 hover:bg-white/70'}`} />
                    ))}
                  </div>
                  <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                    <button onClick={goPrevious} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur transition hover:bg-white hover:text-[#12352e]" aria-label="Previous gallery image"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={goNext} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur transition hover:bg-white hover:text-[#12352e]" aria-label="Next gallery image"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </>
              )}
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <section className="rounded-[28px] border border-white/10 bg-white/[.055] p-5 backdrop-blur-sm sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e6c27a]">Photo story</p>
                <div className="mt-4 flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.07] text-[#e6c27a]"><CalendarDays className="h-4 w-4" /></span>
                  <p className="text-sm leading-7 text-emerald-50/72">{currentPhoto?.description || 'Select a gallery photo to read the achievement, event, research milestone, or context connected to it.'}</p>
                </div>
              </section>
              <section className="rounded-[28px] border border-white/10 bg-white/[.055] p-5 backdrop-blur-sm sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e6c27a]">Related links</p>
                <div className="mt-4 space-y-2">
                  {currentPhoto?.links?.length ? currentPhoto.links.map((href, index) => (
                    <a key={`${href}-${index}`} href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/10 px-3 py-3 text-xs font-semibold text-emerald-50/75 transition hover:border-[#e6c27a]/35 hover:text-white">
                      <span className="min-w-0 truncate">Related source {index + 1}</span><ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#e6c27a]" />
                    </a>
                  )) : <p className="text-xs leading-6 text-emerald-50/42">No related link has been added for this photo.</p>}
                </div>
              </section>
            </div>
          </div>
        </div>

        <aside className="order-4 rounded-[30px] border border-white/10 bg-[#0d322c]/90 p-5 backdrop-blur-sm sm:p-6 lg:row-span-2">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c27a]">Recent research</p>
              <h2 className="mt-2 font-serif text-2xl font-bold tracking-[-0.02em]">Papers &amp; publications</h2>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/[.07]"><FileText className="h-4.5 w-4.5 text-[#e6c27a]" /></span>
          </div>

          <div className="mt-2 max-h-[760px] divide-y divide-white/10 overflow-y-auto pr-1">
            {recentArticles.length ? recentArticles.map((article, index) => (
              <Link key={article.article_uuid} href={`/articles/${article.article_uuid}`} className="group block py-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 font-serif text-lg font-bold text-white/20">{String(index + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#d9bd79]">{formatDate(article.published_at)}</p>
                    <h3 className="mt-2 font-serif text-[17px] font-semibold leading-6 text-white transition group-hover:text-[#f0d79c]">{article.article_title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-50/45 transition group-hover:text-emerald-50/75">Read paper <ArrowUpRight className="h-3 w-3" /></span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="py-8 text-sm leading-7 text-emerald-50/50">Published papers added from the dashboard will automatically appear here.</div>
            )}
          </div>

          <Link href="/articles" className="mt-5 flex items-center justify-between rounded-2xl border border-[#e6c27a]/25 bg-[#e6c27a]/10 px-4 py-3.5 text-xs font-bold text-[#efd89f] transition hover:bg-[#e6c27a] hover:text-[#11372f]">
            Browse all publications <ArrowUpRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>
    </section>
  );
}

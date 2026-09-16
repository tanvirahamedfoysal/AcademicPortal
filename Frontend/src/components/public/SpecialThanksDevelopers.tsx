'use client';

import { useEffect, useState } from 'react';
import { Code2, Database, ExternalLink, KeyRound, Layers3, ServerCog, X } from 'lucide-react';

type DeveloperCredit = {
  id: string;
  name: string;
  role: string;
  image: string;
  initials: string;
  brief: string;
  responsibilities: string[];
  description: string[];
};

const developers: DeveloperCredit[] = [
  {
    id: 'tanvir',
    name: 'Tanvir Ahamed',
    role: 'Backend Developer',
    image: '/developers/tanvir.jpg',
    initials: 'TA',
    brief:
      'Designed and implemented the backend platform that powers authentication, data, publishing, media, student management and the public research portfolio.',
    responsibilities: [
      'FastAPI API architecture',
      'PostgreSQL & Alembic data layer',
      'JWT, role access & OTP workflows',
      'Cloudinary and email integrations',
    ],
    description: [
      'Tanvir Ahamed designed and implemented the backend service architecture behind the academic portal. He organized the FastAPI v1 API surface and the PostgreSQL data model used for user accounts, students, articles, collaborators, uploaded assets, portfolio information, contact messages and other portal records, with Alembic migrations keeping database changes controlled and reproducible.',
      'He built the authentication and account-security layer around Argon2 password hashing and JWT access tokens, including role-aware access for administrators, moderators and students. The backend also handles registration checks, email OTP verification, password-reset flows, profile updates, student verification and moderator-management workflows that the frontend dashboards depend on.',
      'The publishing and content services were also implemented on the backend: article creation and status management, public article delivery, collaborator records, portfolio metadata, repository documents, image/file operations and contact-message handling. Cloudinary is used for managed media storage and Brevo-backed email delivery supports verification workflows, while API validation, error handling and rate limiting help keep the service dependable for the frontend.',
    ],
  },
  {
    id: 'mahruf',
    name: 'Md Mahruf Alam',
    role: 'Frontend Developer & JWT Setter',
    image: '/developers/mahruf.jpg',
    initials: 'MA',
    brief:
      'Designed the complete Next.js interface and connected it to FastAPI, including the JWT/session flow that keeps public pages and role-based workspaces working together.',
    responsibilities: [
      'Next.js UI/UX architecture',
      'FastAPI integration layer',
      'JWT/session & route protection',
      'Responsive dashboards & publishing tools',
    ],
    description: [
      'Md Mahruf Alam designed and implemented the frontend experience using Next.js, React, TypeScript and Tailwind CSS. His work covers the public researcher portfolio, responsive navigation, publications, Lab Members, collaborators, repository resources, contact and authentication screens, together with the separate Admin, Moderator and Student workspaces used to operate the portal.',
      'He connected the frontend to the FastAPI services and implemented the client-side JWT/session integration. After authentication, the frontend consumes the backend access token and role information, persists the session state used by the application, attaches Bearer authorization headers to protected requests and uses Next.js middleware/cookies to guard role-specific routes. This integration is what turns the backend APIs into the live workflows available through the dashboards.',
      'He also developed the responsive portfolio and media experiences, student-management interfaces, profile and repository tools, and the premium article-authoring workflow with rich-text controls and local MathJax/LaTeX rendering. The frontend includes small-screen adaptations, API/state/cache helpers and Netlify deployment configuration so the application can move from local development to a production web experience while remaining connected to the cloud FastAPI backend.',
    ],
  },
];

function DeveloperPortrait({ developer }: { developer: DeveloperCredit }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="grid aspect-[4/3] w-full place-items-center bg-[linear-gradient(135deg,#dff7f6_0%,#edf6ff_100%)]">
        <span className="font-serif text-5xl font-bold tracking-[-0.05em] text-[#527f8f]">{developer.initials}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={developer.image}
      alt={developer.name}
      className="aspect-[4/3] w-full bg-[#edf6ff] object-cover object-center"
      onError={() => setFailed(true)}
    />
  );
}

export default function SpecialThanksDevelopers() {
  const [selected, setSelected] = useState<DeveloperCredit | null>(null);

  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selected]);

  return (
    <>
      <section className="page-shell pt-12 sm:pt-14 lg:pt-20">
        <div className="mb-7 max-w-3xl sm:mb-9">
          <p className="eyebrow">Special thanks</p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-[-0.035em] text-slate-900 sm:text-4xl">Developers behind the portal</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">The platform was built through dedicated backend engineering and frontend integration work.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {developers.map((developer, index) => (
            <article key={developer.id} className="academic-card overflow-hidden">
              <DeveloperPortrait developer={developer} />
              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-2xl font-bold tracking-[-0.025em] text-slate-900 sm:text-3xl">{developer.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#527f8f]">{developer.role}</p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#cfe1ea] bg-[#edf6ff] text-[#5f91a0]">
                    {index === 0 ? <ServerCog className="h-5 w-5" /> : <Code2 className="h-5 w-5" />}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-[15px]">{developer.brief}</p>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {developer.responsibilities.map((item, itemIndex) => {
                    const icons = [Database, KeyRound, Layers3, Code2];
                    const Icon = icons[itemIndex % icons.length];
                    return (
                      <div key={item} className="flex items-start gap-2.5 rounded-xl border border-[#e0ebf0] bg-[#f8fbfd] px-3 py-2.5 text-xs font-semibold leading-5 text-slate-600">
                        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6a9ba8]" />
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(developer)}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#cde3ea] bg-[#dff7f6] px-4 py-2.5 text-sm font-bold text-[#4f8294] transition hover:bg-[#cdeff0]"
                >
                  See more <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selected ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="developer-credit-title" className="max-h-[92dvh] w-full overflow-hidden rounded-t-[28px] border border-[#d7e6ed] bg-[#fffdfb] shadow-2xl sm:max-w-3xl sm:rounded-[28px]">
            <div className="flex items-start justify-between gap-4 border-b border-[#dce7ee] bg-[linear-gradient(135deg,#fffdfb_0%,#edf6ff_100%)] px-5 py-5 sm:px-7">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#689aa6]">Developer contribution</p>
                <h2 id="developer-credit-title" className="mt-2 break-words font-serif text-2xl font-bold tracking-[-0.03em] text-slate-900 sm:text-3xl">{selected.name}</h2>
                <p className="mt-1 text-sm font-semibold text-[#527f8f]">{selected.role}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#dce7ee] bg-[#fffdfb] text-slate-500 transition hover:bg-[#edf6ff]" aria-label="Close developer details"><X className="h-5 w-5" /></button>
            </div>
            <div className="max-h-[calc(92dvh-112px)] overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
              <div className="space-y-5 text-sm leading-7 text-slate-600 sm:text-[15px] sm:leading-8">
                {selected.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <div className="mt-7 border-t border-[#e1ebef] pt-6">
                <h3 className="font-serif text-lg font-bold text-slate-900">Primary responsibilities</h3>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {selected.responsibilities.map((item) => <div key={item} className="rounded-xl bg-[#edf6ff] px-3.5 py-3 text-sm font-semibold text-slate-700">{item}</div>)}
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

import { ArrowUpRight, Network, Users } from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import { getCollaborators, getPortfolio } from '../../lib/public-api';
import { parsePortfolioMedia } from '../../lib/portfolio-media';

export const metadata = { title: 'Collaborators', description: 'Academic collaborators and research network.' };

function safeWebsiteUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(candidate);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export default async function CollaboratorsPage() {
  const [collaborators, portfolio] = await Promise.all([getCollaborators(), getPortfolio()]);
  const savedProfiles = parsePortfolioMedia(portfolio?.research_interests).collaborators;
  const detailsById = new Map(savedProfiles.map((profile) => [profile.uuid, profile]));
  const profiles = collaborators.map((person) => {
    const details = detailsById.get(String(person.uuid));
    return {
      ...person,
      bio: details?.bio ?? person.bio ?? '',
      organization: details?.organization ?? person.organization ?? '',
      website_url: details?.website_url ?? person.website_url ?? '',
    };
  });

  return (
    <MainLayout>
      <section className="border-b border-slate-200 bg-[#fffdfb]">
        <div className="page-shell py-8 sm:py-10 lg:py-12">
          <p className="eyebrow">Academic network</p>
          <h1 className="mt-4 max-w-4xl font-serif text-3xl font-bold tracking-[-0.045em] sm:text-4xl">Research is a collaborative practice.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">People connected to the research program, shared work, and ongoing academic collaborations.</p>
        </div>
      </section>

      <section className="page-shell py-14 lg:py-20">
        <div className="mb-9 flex items-center justify-between border-b border-slate-200 pb-5 text-sm font-semibold text-slate-500">
          <span className="inline-flex items-center gap-2"><Network className="h-4 w-4 text-[#689aa6]" /> Collaboration directory</span>
          <span>{profiles.length} profile{profiles.length === 1 ? '' : 's'}</span>
        </div>
        {profiles.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {profiles.map((person) => {
              const websiteUrl = safeWebsiteUrl(person.website_url);
              const card = (
                <div className={`academic-card h-full overflow-hidden p-6 transition ${websiteUrl ? 'group hover:-translate-y-0.5 hover:border-[#a9d7df] hover:shadow-[0_18px_50px_rgba(15,35,30,0.08)]' : ''}`}>
                  <div className="flex items-center gap-4">
                    {person.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={person.image_url} alt={`${person.name} profile`} className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
                    ) : (
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#5b8796] font-serif text-lg font-bold text-white">{person.name.slice(0, 2).toUpperCase()}</div>
                    )}
                    <div className="min-w-0">
                      <h2 className="break-words font-serif text-xl font-bold tracking-[-0.02em] text-slate-900">{person.name}</h2>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#5f91a0]">{person.organization || 'Collaborator'}</p>
                    </div>
                  </div>
                  {person.bio && <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">{person.bio}</p>}
                  {websiteUrl && <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5f91a0] transition group-hover:text-[#3f7081]">Visit website <ArrowUpRight className="h-4 w-4" /></div>}
                </div>
              );

              return websiteUrl ? (
                <a key={String(person.uuid)} href={websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${person.name}'s website`} className="block h-full outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-[#5f91a0] focus-visible:ring-offset-4">
                  {card}
                </a>
              ) : (
                <article key={String(person.uuid)} className="h-full">{card}</article>
              );
            })}
          </div>
        ) : (
          <div className="academic-card px-6 py-16 text-center"><Users className="mx-auto h-8 w-8 text-[#689aa6]" /><h2 className="mt-5 font-serif text-2xl font-bold">No collaborator profiles published yet</h2><p className="mt-3 text-sm text-slate-500">Profiles created through the collaborator API will show here.</p></div>
        )}
      </section>
    </MainLayout>
  );
}

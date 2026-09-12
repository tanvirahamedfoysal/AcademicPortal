import { Network, Users } from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import { getCollaborators } from '../../lib/public-api';

export const metadata = { title: 'Collaborators', description: 'Academic collaborators and research network.' };

export default async function CollaboratorsPage() {
  const collaborators = await getCollaborators();

  return (
    <MainLayout>
      <section className="border-b border-slate-200 bg-[#fbfcfa]">
        <div className="page-shell py-16 lg:py-20">
          <p className="eyebrow">Academic network</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl font-bold tracking-[-0.045em] sm:text-6xl">Research is a collaborative practice.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">People connected to the research program, shared work, and ongoing academic collaborations.</p>
        </div>
      </section>

      <section className="page-shell py-14 lg:py-20">
        <div className="mb-9 flex items-center justify-between border-b border-slate-200 pb-5 text-sm font-semibold text-slate-500">
          <span className="inline-flex items-center gap-2"><Network className="h-4 w-4 text-emerald-700" /> Collaboration directory</span>
          <span>{collaborators.length} profile{collaborators.length === 1 ? '' : 's'}</span>
        </div>
        {collaborators.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collaborators.map((person) => (
              <article key={String(person.uuid)} className="academic-card overflow-hidden p-6">
                <div className="flex items-center gap-4">
                  {person.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={person.image_url} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#153b35] font-serif text-lg font-bold text-white">{person.name.slice(0, 2).toUpperCase()}</div>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate font-serif text-xl font-bold tracking-[-0.02em]">{person.name}</h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">Collaborator</p>
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-5 text-sm leading-6 text-slate-500">Connected through the portal&apos;s research collaboration network.</div>
              </article>
            ))}
          </div>
        ) : (
          <div className="academic-card px-6 py-16 text-center"><Users className="mx-auto h-8 w-8 text-emerald-700" /><h2 className="mt-5 font-serif text-2xl font-bold">No collaborator profiles published yet</h2><p className="mt-3 text-sm text-slate-500">Profiles created through the collaborator API will show here.</p></div>
        )}
      </section>
    </MainLayout>
  );
}

import { Download, FileArchive, FileText, FolderOpen, ShieldCheck } from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import { getRepositoryDocuments } from '../../lib/public-api';

export const metadata = { title: 'Research Resources', description: 'Shared academic documents and research resources.' };

function getExtension(name: string) {
  const value = name.split('.').pop();
  return value && value !== name ? value.toUpperCase() : 'FILE';
}

export default async function RepositoriesPage() {
  const documents = await getRepositoryDocuments();

  return (
    <MainLayout>
      <section className="border-b border-[#d8e7ee] bg-[linear-gradient(135deg,#edf6ff_0%,#dff7f6_52%,#edf6ff_100%)] text-slate-900">
        <div className="page-shell grid gap-10 py-16 lg:grid-cols-[1fr_.45fr] lg:items-end lg:py-20">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#78bac5]">Open knowledge</p>
            <h1 className="mt-4 font-serif text-5xl font-bold tracking-[-0.045em] sm:text-6xl">Research resources & repository</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-500">A shared archive of documents and academic material supporting research, teaching, and independent learning.</p>
          </div>
          <div className="rounded-2xl border border-[#d4e5ed] bg-[#fffdfb]/78 p-5 shadow-sm">
            <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#78bac5]" /><p className="text-sm font-semibold">Backend-managed document library</p></div>
            <p className="mt-2 text-xs leading-6 text-slate-500">Files shown here come directly from the existing repository API.</p>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Resource library</p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-[-0.03em]">Available documents</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">{documents.length} resource{documents.length === 1 ? '' : 's'}</p>
        </div>

        {documents.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
              <a key={String(document.id)} href={document.url} target="_blank" rel="noreferrer" className="group academic-card flex min-h-[220px] flex-col justify-between p-6 transition duration-300 hover:-translate-y-1 hover:border-[#a9d7df]/20 hover:shadow-[0_18px_50px_rgba(15,35,30,0.08)]">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dff7f6] text-[#5f91a0]"><FileText className="h-5 w-5" /></span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-slate-500">{getExtension(document.name)}</span>
                  </div>
                  <h3 className="mt-7 line-clamp-2 font-serif text-xl font-bold leading-7 tracking-[-0.02em]">{document.name}</h3>
                </div>
                <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-[#5f91a0]">
                  Open resource <Download className="h-4 w-4 transition group-hover:translate-y-0.5" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="academic-card px-6 py-16 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#dff7f6] text-[#5f91a0]"><FolderOpen className="h-6 w-6" /></span>
            <h2 className="mt-6 font-serif text-2xl font-bold">Repository is ready for resources</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">Documents uploaded through the existing backend endpoint will appear here automatically.</p>
          </div>
        )}
      </section>
    </MainLayout>
  );
}

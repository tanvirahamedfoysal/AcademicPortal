import MainLayout from '../../components/MainLayout';
import RepositoryClient from './RepositoryClient';

export const metadata = { title: 'Research Resources', description: 'Shared academic documents and research resources.' };

export default function RepositoriesPage() {
  return <MainLayout>
    <section className="border-b border-[#d8e7ee] bg-[linear-gradient(135deg,#edf6ff_0%,#dff7f6_52%,#edf6ff_100%)] text-slate-900">
      <div className="page-shell py-16 lg:py-20"><h1 className="font-serif text-5xl font-bold">Research resources & repository</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-slate-500">A shared archive of documents and academic material supporting research, teaching, and independent learning.</p></div>
    </section>
    <section className="page-shell py-14"><div className="mb-8"><p className="eyebrow">Resource library</p><h2 className="mt-3 font-serif text-3xl font-bold">Available documents</h2></div><RepositoryClient /></section>
  </MainLayout>;
}

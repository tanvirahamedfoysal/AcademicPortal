import MainLayout from '@/components/MainLayout';
import { FileText, Github, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <MainLayout>
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0 shadow-lg" />
          <div>
            <div className="inline-block mb-3 px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full text-xs tracking-wide">
              Principal Researcher
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Advancing the frontiers of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Computer Science</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              A centralized portfolio dedicated to publishing peer-reviewed academic documents, open-source software architectures and collaborative data science projects.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <FileText className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">40+ Publications</h3>
            <p className="text-sm text-slate-500">Peer-reviewed journals and conference proceedings.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <Github className="w-8 h-8 text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Open Source</h3>
            <p className="text-sm text-slate-500">Active maintainer of robust research toolings.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <Users className="w-8 h-8 text-teal-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Global Network</h3>
            <p className="text-sm text-slate-500">Collaborating with top institutions worldwide.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
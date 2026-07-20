import MainLayout from '@/components/MainLayout';
import { Users } from 'lucide-react';

export default function CollaboratorsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Academic Collaborators</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Section under construction......waiting for api updates.
        </p>
      </div>
    </MainLayout>
  );
}
import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-500 w-full">
      <div className="relative flex items-center justify-center">
        {}
        <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 relative z-10" />
      </div>
      <p className="text-sm font-medium animate-pulse tracking-wide">
        Loading application data...
      </p>
    </div>
  );
}
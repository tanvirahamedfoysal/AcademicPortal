import Link from 'next/link';
import { ArrowLeft, BookOpenText, FlaskConical, LockKeyhole, ShieldCheck } from 'lucide-react';
import LoginForm from '../../../forms/LoginForm';

export const metadata = { title: 'Sign In', description: 'Sign in to the academic research portal.' };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0b2823] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1420px] overflow-hidden rounded-[28px] border border-white/10 bg-[#f7f9f6] shadow-2xl lg:grid-cols-[.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#123831] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute inset-0 soft-grid opacity-20" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3 font-serif text-xl font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><ShieldCheck className="h-5 w-5" /></span> Researcher&apos;s Eden</Link>
          </div>
          <div className="relative max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e6c27a]">Member portal</p>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-[1.05] tracking-[-0.04em]">Return to your research workspace.</h1>
            <p className="mt-6 text-base leading-8 text-emerald-50/65">Manage publications, resources, collaborators, students, messages, and profile information from one focused academic environment.</p>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {[['Publish', BookOpenText], ['Research', FlaskConical], ['Secure', LockKeyhole]].map(([label, Icon]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[.05] p-4 text-sm font-semibold"><Icon className="mb-4 h-4 w-4 text-[#e6c27a]" />{label as string}</div>)}
            </div>
          </div>
          <p className="relative text-xs text-emerald-50/40">Academic portfolio · learning portal · research operations</p>
        </section>

        <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0f3b34] lg:hidden"><ArrowLeft className="h-4 w-4" /> Back to portfolio</Link>
            <p className="eyebrow">Secure access</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.035em]">Welcome back</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Use the username or email attached to your portal account.</p>
            <div className="mt-8"><LoginForm /></div>
            <div className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">New student? <Link href="/auth/register" className="font-bold text-[#0f3b34] hover:underline">Create an account</Link></div>
          </div>
        </section>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { ArrowLeft, BookOpenText, FlaskConical, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LoginForm from '../../../forms/LoginForm';

export const metadata = { title: 'Sign In', description: 'Sign in to the academic research portal.' };

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-[linear-gradient(145deg,#fffaf7_0%,#edf6ff_58%,#dff7f6_100%)] p-0 sm:p-4 lg:p-6">
      <div className="mx-auto grid min-h-dvh max-w-[1320px] overflow-hidden border-[#d9e6ee] bg-[#fffdfb] shadow-[0_24px_70px_rgba(73,101,126,.10)] sm:min-h-[calc(100dvh-2rem)] sm:rounded-[26px] sm:border lg:min-h-[calc(100dvh-3rem)] xl:grid-cols-[.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#edf6ff_0%,#dff7f6_55%,#edf6ff_100%)] p-10 text-slate-900 xl:flex xl:flex-col xl:justify-between 2xl:p-14">
          <div className="absolute inset-0 soft-grid opacity-20" />
          <div className="relative"><Link href="/" className="inline-flex items-center gap-3 font-serif text-xl font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fffdfb]/90"><ShieldCheck className="h-5 w-5" /></span> Dr. Tania Islam</Link></div>
          <div className="relative max-w-xl">
            <h1 className="font-serif text-5xl font-bold leading-[1.05] tracking-[-0.04em]">Research workspace.</h1>
            <p className="mt-6 text-base leading-8 text-slate-500">Sign in to manage publications, resources, collaborators, students and profile information.</p>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {([
                { label: 'Publish', Icon: BookOpenText },
                { label: 'Research', Icon: FlaskConical },
                { label: 'Secure', Icon: LockKeyhole },
              ] satisfies Array<{ label: string; Icon: LucideIcon }>).map(({ label, Icon }) => (
                <div key={label} className="rounded-2xl border border-[#d6e5ec] bg-[#fffdfb]/75 p-4 text-sm font-semibold"><Icon className="mb-4 h-4 w-4 text-[#6fa8b4]" />{label}</div>
              ))}
            </div>
          </div>
          <p className="relative text-xs text-slate-500">Academic portfolio · research portal</p>
        </section>

        <section className="flex items-start justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-16 xl:items-center">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#5f91a0] xl:hidden"><ArrowLeft className="h-4 w-4" /> Back to portfolio</Link>
            <h2 className="font-serif text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">Welcome back</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Use the username or email attached to your account.</p>
            <div className="mt-8"><LoginForm /></div>
            <div className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">New student? <Link href="/auth/register" className="font-bold text-[#5f91a0] hover:underline">Create an account</Link></div>
          </div>
        </section>
      </div>
    </main>
  );
}

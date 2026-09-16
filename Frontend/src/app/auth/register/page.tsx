import Link from 'next/link';
import { ArrowLeft, GraduationCap, ShieldCheck, UsersRound } from 'lucide-react';
import RegisterForm from '../../../forms/RegisterForm';

export const metadata = { title: 'Create Account', description: 'Join the academic research portal as a student.' };

export default function RegisterPage() {
  return (
    <main className="min-h-dvh bg-[linear-gradient(145deg,#fffaf7_0%,#edf6ff_58%,#dff7f6_100%)] p-0 sm:p-4 lg:p-6">
      <div className="mx-auto grid min-h-dvh max-w-[1320px] overflow-hidden border-[#d9e6ee] bg-[#fffdfb] shadow-[0_24px_70px_rgba(73,101,126,.10)] sm:min-h-[calc(100dvh-2rem)] sm:rounded-[26px] sm:border lg:min-h-[calc(100dvh-3rem)] xl:grid-cols-[.82fr_1.18fr]">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#edf6ff_0%,#dff7f6_55%,#edf6ff_100%)] p-10 text-slate-900 xl:flex xl:flex-col xl:justify-between 2xl:p-14">
          <div className="absolute inset-0 soft-grid opacity-20" />
          <Link href="/" className="relative inline-flex items-center gap-3 font-serif text-xl font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fffdfb]/90"><ShieldCheck className="h-5 w-5" /></span> Dr. Tania Islam</Link>
          <div className="relative max-w-lg">
            <h1 className="font-serif text-5xl font-bold leading-[1.05] tracking-[-0.04em]">Student access to the academic portal.</h1>
            <p className="mt-6 text-base leading-8 text-slate-500">Create an account, verify your email, and wait for account approval before entering the student workspace.</p>
            <div className="mt-9 flex items-center gap-4 rounded-2xl border border-[#d6e5ec] bg-[#fffdfb]/75 p-5"><UsersRound className="h-6 w-6 text-[#6fa8b4]" /><div><p className="font-serif text-lg font-bold">Research lab network</p><p className="mt-1 text-xs text-slate-500">Articles · resources · collaborators</p></div></div>
          </div>
          <div className="relative flex items-center gap-2 text-xs text-slate-500"><GraduationCap className="h-4 w-4" /> Student registration</div>
        </section>

        <section className="flex items-start justify-center px-5 py-7 sm:px-10 sm:py-10 lg:px-14 xl:items-center xl:px-16">
          <div className="w-full max-w-[560px]">
            <Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#5f91a0] xl:hidden"><ArrowLeft className="h-4 w-4" /> Back to portfolio</Link>
            <h2 className="font-serif text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">Create your portal account</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">Enter your details and verify the email address with the six-digit code.</p>
            <div className="mt-7"><RegisterForm /></div>
            <div className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">Already registered? <Link href="/auth/login" className="font-bold text-[#5f91a0] hover:underline">Sign in</Link></div>
          </div>
        </section>
      </div>
    </main>
  );
}

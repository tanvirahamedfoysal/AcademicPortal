import Link from 'next/link';
import { ArrowLeft, GraduationCap, ShieldCheck, UsersRound } from 'lucide-react';
import RegisterForm from '../../../forms/RegisterForm';

export const metadata = { title: 'Create Account', description: 'Join the academic research portal as a student.' };

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#fffaf7_0%,#edf6ff_52%,#edf6ff_100%)] p-3 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1420px] overflow-hidden rounded-[28px] border border-[#d9e6ee] bg-[#fffdfb] shadow-[0_24px_70px_rgba(73,101,126,.12)] lg:grid-cols-[.78fr_1.22fr]">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#edf6ff_0%,#dff7f6_48%,#edf6ff_100%)] p-12 text-slate-900 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute inset-0 soft-grid opacity-20" />
          <Link href="/" className="relative inline-flex items-center gap-3 font-serif text-xl font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fffdfb]/85"><ShieldCheck className="h-5 w-5" /></span> Dr. Tania Islam</Link>
          <div className="relative max-w-lg">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#78bac5]">Academic community</p>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-[1.05] tracking-[-0.04em]">Join a portal built around learning and research.</h1>
            <p className="mt-6 text-base leading-8 text-slate-500">Student registration uses the existing email OTP workflow. Accounts enter the portal as pending until the current backend verification process is completed.</p>
            <div className="mt-9 flex items-center gap-4 rounded-2xl border border-[#d6e5ec] bg-[#fffdfb]/70 p-5"><UsersRound className="h-6 w-6 text-[#78bac5]" /><div><p className="font-serif text-lg font-bold">Research community access</p><p className="mt-1 text-xs text-slate-500">Articles · resources · collaborators · profile</p></div></div>
          </div>
          <div className="relative flex items-center gap-2 text-xs text-slate-500"><GraduationCap className="h-4 w-4" /> Student registration</div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-xl">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#5f91a0] lg:hidden"><ArrowLeft className="h-4 w-4" /> Back to portfolio</Link>
            <p className="eyebrow">Student registration</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.035em]">Create your portal account</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Complete the details below, verify your email with the six-digit OTP, and submit your account.</p>
            <div className="mt-8"><RegisterForm /></div>
            <div className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">Already registered? <Link href="/auth/login" className="font-bold text-[#5f91a0] hover:underline">Sign in</Link></div>
          </div>
        </section>
      </div>
    </main>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  AtSign,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  User,
} from 'lucide-react';

const OTP_LIFETIME_SECONDS = 120;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,30}$/;

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function useOtpCountdown() {
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(0);
      return;
    }

    const deadline = expiresAt;
    function update() {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setExpiresAt(null);
    }

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  return {
    secondsLeft,
    start: useCallback(() => {
      setExpiresAt(Date.now() + OTP_LIFETIME_SECONDS * 1000);
      setSecondsLeft(OTP_LIFETIME_SECONDS);
    }, []),
    clear: useCallback(() => {
      setExpiresAt(null);
      setSecondsLeft(0);
    }, []),
  };
}

export default function RegisterForm() {
  const router = useRouter();
  const countdown = useOtpCountdown();

  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [studentBatch, setStudentBatch] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const fieldErrors = useMemo(() => ({
    name: name.trim().length < 2 ? 'Enter your full name.' : '',
    username: USERNAME_PATTERN.test(username.trim()) ? '' : 'Use 3–30 letters, numbers, dots, underscores or hyphens.',
    email: EMAIL_PATTERN.test(email.trim()) ? '' : 'Enter a valid email address.',
    batch: studentBatch.trim() ? '' : 'Enter your student batch.',
    password: password.length >= 8 ? '' : 'Use at least 8 characters.',
  }), [email, name, password, studentBatch, username]);

  const firstStepValid = Object.values(fieldErrors).every((message) => !message);

  const parseFastApiError = (payload: any, defaultMessage: string) => {
    if (payload?.detail) {
      if (Array.isArray(payload.detail)) {
        return payload.detail.map((err: any) => `${err.loc?.[err.loc.length - 1] || 'field'}: ${err.msg}`).join(' | ');
      }
      return String(payload.detail);
    }
    return payload?.message || defaultMessage;
  };

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttempted(true);
    setError(null);
    if (!firstStepValid) return;

    setIsLoading(true);
    try {
      const cleanUsername = username.trim();
      const cleanEmail = email.trim().toLowerCase();

      const userRes = await fetch('/api/auth/validate-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername }),
      });
      const userPayload = await userRes.json().catch(() => ({}));
      if (!userRes.ok) throw new Error(parseFastApiError(userPayload, 'Unable to validate the username.'));
      if (userPayload.is_available === false) throw new Error(userPayload.message || 'Username is already taken.');

      const otpRes = await fetch('/api/auth/register/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const otpPayload = await otpRes.json().catch(() => ({}));
      if (!otpRes.ok) throw new Error(parseFastApiError(otpPayload, 'Failed to send verification OTP.'));

      setEmail(cleanEmail);
      setUsername(cleanUsername);
      setOtp('');
      countdown.start();
      setSuccessMsg('A six-digit verification code was sent to your email.');
      setStep(2);
      setAttempted(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (countdown.secondsLeft <= 0) {
      setError('This verification code has expired. Request a new one.');
      return;
    }

    if (otp.length !== 6) {
      setError('Enter the complete six-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          student_batch: studentBatch.trim(),
          password,
          otp: otp.trim(),
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseFastApiError(payload, 'Registration failed.'));

      countdown.clear();
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown.secondsLeft > 0 || isLoading) return;
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const otpRes = await fetch('/api/auth/register/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const otpPayload = await otpRes.json().catch(() => ({}));
      if (!otpRes.ok) throw new Error(parseFastApiError(otpPayload, 'Failed to resend OTP.'));

      setOtp('');
      countdown.start();
      setSuccessMsg('A new verification code was sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const iconClass = 'h-5 w-5 text-slate-400';

  return (
    <div className="w-full">
      {error && <div role="alert" className="mb-5 rounded-xl border border-[#cde3ea] bg-[#edf6ff] p-3.5 text-sm leading-6 text-[#416f7e]">{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
          <Field label="Full name" htmlFor="name" error={attempted ? fieldErrors.name : ''}>
            <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${iconClass}`} />
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="form-control min-h-12 pl-10" placeholder="Full name" aria-invalid={Boolean(attempted && fieldErrors.name)} />
          </Field>

          <Field label="Username" htmlFor="username" error={attempted ? fieldErrors.username : ''}>
            <AtSign className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${iconClass}`} />
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))} autoComplete="username" className="form-control min-h-12 pl-10" placeholder="username" aria-invalid={Boolean(attempted && fieldErrors.username)} />
          </Field>

          <Field label="Email address" htmlFor="email" error={attempted ? fieldErrors.email : ''}>
            <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${iconClass}`} />
            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" className="form-control min-h-12 pl-10" placeholder="name@example.com" aria-invalid={Boolean(attempted && fieldErrors.email)} />
          </Field>

          <Field label="Student batch" htmlFor="studentBatch" error={attempted ? fieldErrors.batch : ''}>
            <GraduationCap className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${iconClass}`} />
            <input id="studentBatch" value={studentBatch} onChange={(e) => setStudentBatch(e.target.value)} className="form-control min-h-12 pl-10" placeholder="e.g. 2024" aria-invalid={Boolean(attempted && fieldErrors.batch)} />
          </Field>

          <Field label="Password" htmlFor="password" error={attempted ? fieldErrors.password : ''}>
            <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${iconClass}`} />
            <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="form-control min-h-12 pl-10 pr-12" placeholder="At least 8 characters" aria-invalid={Boolean(attempted && fieldErrors.password)} />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-[#edf6ff] hover:text-[#527f8f]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Field>

          <button type="submit" disabled={isLoading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4f8294] disabled:cursor-not-allowed disabled:opacity-60">
            {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Sending code…</> : 'Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-5">
          {successMsg && countdown.secondsLeft > 0 && <div className="flex items-start gap-2 rounded-xl border border-[#cde3ea] bg-[#dff7f6] p-3.5 text-sm leading-6 text-[#416f7e]"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><p>{successMsg}</p></div>}

          <div className="flex items-start justify-between gap-4 rounded-xl border border-[#dce7ee] bg-[#f8fbfd] p-4">
            <div className="flex min-w-0 items-start gap-3 text-slate-700"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#6fa8b4]" /><div className="min-w-0 text-sm"><p className="font-semibold">{countdown.secondsLeft > 0 ? `${formatCountdown(countdown.secondsLeft)} remaining` : 'Code expired'}</p><p className="mt-1 break-all text-slate-500">{email}</p></div></div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="otp">Verification code</label>
            <input id="otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} disabled={countdown.secondsLeft <= 0} required className="form-control min-h-14 text-center text-xl font-semibold tracking-[0.45em] disabled:bg-slate-100 disabled:text-slate-400" placeholder="000000" />
          </div>

          {countdown.secondsLeft > 0 ? (
            <button type="submit" disabled={isLoading || otp.length !== 6} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4f8294] disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating account…</> : 'Verify and create account'}
            </button>
          ) : (
            <button type="button" onClick={resendOtp} disabled={isLoading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#dce7ee] bg-[#fffdfb] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#edf6ff] disabled:opacity-60">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />} Resend code
            </button>
          )}

          <button type="button" onClick={() => { setStep(1); countdown.clear(); setOtp(''); setSuccessMsg(null); setError(null); }} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-500 transition hover:bg-[#edf6ff] hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Change registration details
          </button>
        </form>
      )}
    </div>
  );
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">{children}</div>
      {error && <p className="mt-1.5 text-xs font-medium text-[#527f8f]">{error}</p>}
    </div>
  );
}

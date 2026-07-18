'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, AtSign, Loader2, Clock, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';

const OTP_LIFETIME_SECONDS = 120;

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userRes = await fetch(`/api/auth/validate-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() })
      });
      
      const userPayload = await userRes.json().catch(() => ({}));
      if (userRes.ok && userPayload.is_valid === false) {
        throw new Error(userPayload.message || "Username is already taken.");
      }
      if (!userRes.ok) {
        throw new Error("Unable to validate the username.");
      }

      const otpRes = await fetch("/api/auth/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      
      const otpPayload = await otpRes.json().catch(() => ({}));
      if (!otpRes.ok) {
        throw new Error(otpPayload.message || "Failed to send verification OTP.");
      }

      setOtp('');
      countdown.start();
      setSuccessMsg("A six-digit OTP was sent to your email. Enter it before the timer ends.");
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (countdown.secondsLeft <= 0) {
      setError("This OTP has expired. Please go back and request a new one.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          otp: otp.trim(),
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.message || "Registration failed.");
      }

      countdown.clear();
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
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
      const otpRes = await fetch("/api/auth/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!otpRes.ok) throw new Error("Failed to resend OTP.");
      
      setOtp('');
      countdown.start();
      setSuccessMsg("A fresh OTP has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}
      
      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                required
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Dr. Jane Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                required
                minLength={3}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-colors"
                placeholder="johndoe123"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              Academic Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-colors"
                placeholder="researcher@university.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={8}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Sending OTP...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-5">
          {successMsg && countdown.secondsLeft > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-3 text-slate-700">
              <Clock className="h-5 w-5 text-slate-400" />
              <div className="text-sm">
                <p className="font-medium">
                  {countdown.secondsLeft > 0 
                    ? `${formatCountdown(countdown.secondsLeft)} remaining` 
                    : "OTP Expired"}
                </p>
                <p className="text-slate-500">Sent to {email}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="otp">
              6-Digit Verification Code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              disabled={countdown.secondsLeft <= 0}
              required
              className="block w-full px-3 py-2 text-center tracking-widest text-lg border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
              placeholder="000000"
            />
          </div>

          {countdown.secondsLeft > 0 ? (
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Creating account...
                </>
              ) : (
                'Verify & Register'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={resendOtp}
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-500" />
              ) : (
                <RefreshCw className="-ml-1 mr-2 h-5 w-5 text-slate-500" />
              )}
              Resend OTP
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setStep(1);
              countdown.clear();
              setOtp('');
              setError(null);
            }}
            className="w-full flex justify-center items-center py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to details
          </button>
        </form>
      )}
    </div>
  );
}
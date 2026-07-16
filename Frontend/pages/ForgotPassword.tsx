import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI, ApiError } from "../lib/api";
import { Button, Input } from "../components/ui";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await AuthAPI.requestPasswordResetOtp({ email });
      setStep(2);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send reset code.");
    } finally {
      setLoading(false);
    }
  }

  async function reset(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await AuthAPI.resetPassword({ email, otp, new_password: newPassword });
      navigate("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center font-semibold text-brand-700 mb-8">
          Academic Research Portal
        </Link>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h1 className="text-lg font-semibold text-slate-800 mb-1">Reset password</h1>
          {step === 1 ? (
            <form onSubmit={requestOtp} className="space-y-3 mt-4">
              <Input type="email" placeholder="Your account email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full justify-center">
                {loading ? "Sending..." : "Send reset code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={reset} className="space-y-3 mt-4">
              <Input placeholder="OTP code" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full justify-center">
                {loading ? "Updating..." : "Update password"}
              </Button>
            </form>
          )}
          <p className="mt-4 text-xs text-center text-slate-500">
            <Link to="/login" className="text-brand-700 font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

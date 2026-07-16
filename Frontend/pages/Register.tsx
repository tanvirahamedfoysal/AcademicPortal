import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI, ApiError } from "../lib/api";
import { Button, Input } from "../components/ui";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    student_batch: "",
    otp: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function requestOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await AuthAPI.requestRegisterOtp({ email: form.email });
      setStep(2);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function completeRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await AuthAPI.register(form);
      navigate("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center font-semibold text-brand-700 mb-8">
          Academic Research Portal
        </Link>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h1 className="text-lg font-semibold text-slate-800 mb-1">Create student account</h1>
          <p className="text-sm text-slate-400 mb-6">
            {step === 1 ? "Step 1 of 2 — your details" : "Step 2 of 2 — verify your email"}
          </p>

          {step === 1 && (
            <form onSubmit={requestOtp} className="space-y-3">
              <Field label="Full name">
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </Field>
              <Field label="Username">
                <Input value={form.username} onChange={(e) => update("username", e.target.value)} required />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </Field>
              <Field label="Password">
                <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
              </Field>
              <Field label="Student batch">
                <Input value={form.student_batch} onChange={(e) => update("student_batch", e.target.value)} required />
              </Field>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full justify-center">
                {loading ? "Sending OTP..." : "Send verification code"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={completeRegister} className="space-y-3">
              <Field label="OTP code">
                <Input value={form.otp} onChange={(e) => update("otp", e.target.value)} required autoFocus />
              </Field>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full justify-center">
                {loading ? "Creating account..." : "Complete registration"}
              </Button>
            </form>
          )}

          <p className="mt-4 text-xs text-center text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

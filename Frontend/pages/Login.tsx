import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/ui";
import { ApiError } from "../lib/api";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate(user.profile_type === "STUDENT" ? "/student" : "/admin", { replace: true });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
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
          <h1 className="text-lg font-semibold text-slate-800 mb-1">Sign in</h1>
          <p className="text-sm text-slate-400 mb-6">Access your dashboard</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Username or email</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1" autoFocus />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full justify-center">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 flex justify-between text-xs text-slate-500">
            <Link to="/register" className="hover:text-brand-700">
              Create student account
            </Link>
            <Link to="/forgot-password" className="hover:text-brand-700">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

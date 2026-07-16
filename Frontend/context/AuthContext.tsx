import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthAPI, ProfileAPI, setToken } from "../lib/api";
import { getCached, setCached } from "../lib/cache";

export type CurrentUser = {
  uuid: string;
  email: string;
  status: string;
  user_role: string;
  profile_type: "ADMIN" | "STUDENT" | "USER" | "MODERATOR";
  profile_image?: string;
  user_updated_at?: string;
  student_batch?: string;
};

type AuthState = {
  user: CurrentUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

const USER_CACHE_KEY = "auth:me";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("arp_token");
      if (!token) {
        setLoading(false);
        return;
      }
      // Show cached profile instantly, then quietly revalidate.
      const cached = await getCached<CurrentUser>(USER_CACHE_KEY);
      if (cached) setUser(cached);
      try {
        const res = await ProfileAPI.me();
        const data = res.data as CurrentUser;
        setUser(data);
        await setCached(USER_CACHE_KEY, data, data.user_updated_at);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(username: string, password: string) {
    const res = await AuthAPI.login(username, password);
    setToken(res.access_token);
    setUser(res.user);
    await setCached(USER_CACHE_KEY, res.user, res.user?.user_updated_at);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

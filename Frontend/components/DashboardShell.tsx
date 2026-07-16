import { NavLink, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export type NavItem = { to: string; label: string; icon: string; end?: boolean };
export type NavGroup = { title: string; items: NavItem[] };

export default function DashboardShell({
  groups,
  title,
  subtitle,
  children,
  headerAction,
}: {
  groups: NavGroup[];
  title: string;
  subtitle: string;
  children: ReactNode;
  headerAction?: ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-100">
          <span className="text-brand-600 text-xl">⚡</span>
          <span className="font-semibold text-slate-800">Portal Console</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="px-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-1">{g.title}</p>
              <div className="space-y-0.5">
                {g.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                        isActive ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600 hover:bg-slate-100"
                      }`
                    }
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full text-left px-2.5 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50"
          >
            ⏻ Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div>
            <h1 className="font-semibold text-slate-800">{title}</h1>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {headerAction}
            <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
              {(user?.email ?? "U").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/researchers", label: "Researchers" },
  { to: "/articles", label: "Articles" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg text-brand-700">
          Academic Research Portal
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-slate-600 hover:text-brand-700 ${isActive ? "text-brand-700 font-medium" : ""}`
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div>
          {user ? (
            <Link
              to={user.profile_type === "STUDENT" ? "/student" : "/admin"}
              className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
            >
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

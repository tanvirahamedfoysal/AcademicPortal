import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-5xl font-bold text-brand-600">404</p>
      <p className="mt-2 text-slate-500">Page not found.</p>
      <Link to="/" className="mt-6 text-sm font-medium text-brand-700">
        Back to home
      </Link>
    </div>
  );
}

import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>;
}

export function StatCard({ label, value, tone = "slate", badge }: { label: string; value: string | number; tone?: string; badge?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold text-${tone}-700`}>{value}</p>
      {badge && (
        <span className="mt-3 inline-block text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </Card>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "outline" }) {
  const styles: Record<string, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    ghost: "text-brand-700 hover:bg-brand-50",
    danger: "text-rose-600 hover:bg-rose-50",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
  };
  return (
    <button
      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "green" | "amber" | "rose" | "blue" }) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return <span className={`text-xs font-medium px-2 py-1 rounded-full ${tones[tone]}`}>{children}</span>;
}

export function Spinner() {
  return <div className="h-5 w-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />;
}

export function EmptyState({ text }: { text: string }) {
  return <div className="text-center text-sm text-slate-400 py-10">{text}</div>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${props.className ?? ""}`}
    />
  );
}

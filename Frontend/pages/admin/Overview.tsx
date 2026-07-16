import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticlesAPI, ContactAPI, StudentsAPI } from "../../lib/api";
import { cachedFetch } from "../../lib/cache";
import { Card, StatCard } from "../../components/ui";

export default function Overview() {
  const [pending, setPending] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    cachedFetch("admin:students:pending", () => StudentsAPI.listPending(), {
      onCache: (d: any) => setPending(d?.data ?? []),
    }).then((d: any) => setPending(d?.data ?? []));

    cachedFetch("admin:articles", () => ArticlesAPI.list(), {
      onCache: (d: any) => setArticles(d?.data ?? []),
    }).then((d: any) => setArticles(d?.data ?? []));

    cachedFetch("admin:contact", () => ContactAPI.list(), {
      onCache: (d: any) => setMessages(d?.data ?? []),
    }).then((d: any) => setMessages(d?.data ?? []));

    cachedFetch("admin:students:all", () => StudentsAPI.list(), {
      onCache: (d: any) => setStudents(d?.data ?? []),
    }).then((d: any) => setStudents(d?.data ?? []));
  }, []);

  const draftArticles = articles.filter((a) => a.status === "DRAFT" || a.status === "draft");

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Registrations" value={pending.length} badge={pending.length ? "Needs Review" : undefined} />
        <StatCard label="Draft Articles" value={draftArticles.length} />
        <StatCard label="Unread Messages" value={messages.length} />
        <StatCard label="Active Students" value={students.length} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold text-slate-800 mb-4">Pending student registrations</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing pending review.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.slice(0, 6).map((s) => (
                <div key={s.uuid} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-700">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </div>
                  <Link to="/admin/students" className="text-brand-700 font-medium">
                    Review →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Recent messages</h2>
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400">Inbox is empty.</p>
          ) : (
            <div className="space-y-3">
              {messages.slice(0, 5).map((m: any, i: number) => (
                <div key={m.id ?? i} className="text-sm">
                  <p className="font-medium text-slate-700">{m.name ?? m.email}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

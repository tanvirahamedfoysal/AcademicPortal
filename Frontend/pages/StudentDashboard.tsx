import { FormEvent, useEffect, useState } from "react";
import DashboardShell, { NavGroup } from "../components/DashboardShell";
import { ArticlesAPI, ProfileAPI, ApiError } from "../lib/api";
import { cachedFetch } from "../lib/cache";
import { useAuth } from "../context/AuthContext";
import { Badge, Button, Card, EmptyState, Input, Spinner, Textarea } from "../components/ui";
import CachedImage from "../components/CachedImage";

const groups: NavGroup[] = [
  { title: "Overview", items: [{ to: "/student", label: "My dashboard", icon: "📊", end: true }] },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(user);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([ProfileAPI.me(), ArticlesAPI.list()]);
      setProfile(p?.data ?? p);
      setArticles(a?.data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cachedFetch("student:profile", () => ProfileAPI.me(), { onCache: (d: any) => setProfile(d?.data ?? d) });
    cachedFetch("student:articles", () => ArticlesAPI.list(), { onCache: (d: any) => setArticles(d?.data ?? []) });
    load();
  }, []);

  async function submitArticle(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await ArticlesAPI.create(form);
      setForm({ title: "", body: "" });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit article.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardShell groups={groups} title="Student Dashboard" subtitle="Your profile & submissions">
      <div className="space-y-6">
        <Card className="p-6 flex items-center gap-4">
          <CachedImage
            src={profile?.profile_image}
            updatedAt={profile?.user_updated_at}
            alt={profile?.email ?? "Profile"}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-slate-800">{profile?.email}</p>
            <p className="text-sm text-slate-400">Batch {profile?.student_batch ?? "—"}</p>
            <Badge tone={profile?.status === "ACTIVE" ? "green" : "amber"}>{profile?.status ?? "—"}</Badge>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-5 h-fit">
            <h2 className="font-semibold text-slate-800 mb-3">Submit an article</h2>
            <form onSubmit={submitArticle} className="space-y-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Body" rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={busy}>
                {busy ? "Submitting..." : "Submit for review"}
              </Button>
            </form>
          </Card>

          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-semibold text-slate-800">My articles</h2>
            {loading ? (
              <div className="p-10 flex justify-center">
                <Spinner />
              </div>
            ) : articles.length === 0 ? (
              <EmptyState text="You haven't submitted any articles yet." />
            ) : (
              articles.map((a) => (
                <Card key={a.uuid ?? a.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">{a.title}</p>
                    <Badge tone={a.status === "PUBLISHED" ? "green" : "amber"}>{a.status ?? "DRAFT"}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{a.body ?? a.content}</p>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

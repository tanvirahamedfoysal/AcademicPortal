import { FormEvent, useEffect, useState } from "react";
import { PortfolioAPI, ApiError } from "../../lib/api";
import { Button, Card, Input, Spinner, Textarea } from "../../components/ui";

const fields: Array<{ key: string; label: string; area?: boolean }> = [
  { key: "school", label: "School" },
  { key: "college", label: "College" },
  { key: "public_bio", label: "Public bio", area: true },
  { key: "research_description", label: "Research description", area: true },
  { key: "email", label: "Contact email" },
  { key: "phone", label: "Phone" },
  { key: "github_url", label: "GitHub URL" },
  { key: "orcid_url", label: "ORCID URL" },
  { key: "researchgate_url", label: "ResearchGate URL" },
  { key: "google_scholar_url", label: "Google Scholar URL" },
  { key: "cv_url", label: "CV URL" },
  { key: "linkedin_url", label: "LinkedIn URL" },
];

export default function AdminPortfolio() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    PortfolioAPI.get()
      .then((res) => setForm(res?.data ?? {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await PortfolioAPI.replace(form);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Card className="p-6 max-w-3xl">
      <h2 className="font-semibold text-slate-800 mb-4">Portfolio</h2>
      <form onSubmit={submit} className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-medium text-slate-600">{f.label}</label>
            <div className="mt-1">
              {f.area ? (
                <Textarea rows={4} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              ) : (
                <Input value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              )}
            </div>
          </div>
        ))}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {saved && <p className="text-sm text-emerald-600">Saved.</p>}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save portfolio"}
        </Button>
      </form>
    </Card>
  );
}

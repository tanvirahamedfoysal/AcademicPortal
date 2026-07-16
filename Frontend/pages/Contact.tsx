import { FormEvent, useEffect, useState } from "react";
import PublicNavbar from "../components/PublicNavbar";
import { ContactAPI, ApiError } from "../lib/api";
import { cachedFetch } from "../lib/cache";
import { Button, Card, Input, Textarea } from "../components/ui";

export default function Contact() {
  const [meta, setMeta] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cachedFetch("public:contact:meta", () => ContactAPI.meta(), {
      onCache: (d: any) => setMeta(d?.data ?? d),
    }).then((d: any) => setMeta(d?.data ?? d));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await ContactAPI.submit(form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Could not send your message.");
    }
  }

  return (
    <div>
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-800">Contact</h1>
        <p className="text-sm text-slate-500 mt-1">Reach out for collaboration, inquiries, or feedback.</p>

        {meta && (
          <Card className="p-5 mt-6 text-sm text-slate-600 space-y-1">
            {meta.email && <p>Email: {meta.email}</p>}
            {meta.phone && <p>Phone: {meta.phone}</p>}
            {meta.address && <p>Address: {meta.address}</p>}
          </Card>
        )}

        <Card className="p-6 mt-6">
          {status === "sent" ? (
            <p className="text-emerald-600 text-sm font-medium">Thanks — your message has been sent.</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input
                type="email"
                placeholder="Your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Textarea
                placeholder="Your message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending..." : "Send message"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

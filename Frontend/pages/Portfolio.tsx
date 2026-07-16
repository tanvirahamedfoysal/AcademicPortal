import { useEffect, useState } from "react";
import PublicNavbar from "../components/PublicNavbar";
import { PortfolioAPI } from "../lib/api";
import { cachedFetch } from "../lib/cache";
import { Card, EmptyState, Spinner } from "../components/ui";

export default function Portfolio() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cachedFetch("public:portfolio", () => PortfolioAPI.get(), {
      onCache: (d: any) => setData(d?.data ?? d),
    })
      .then((d: any) => setData(d?.data ?? d))
      .finally(() => setLoading(false));
  }, []);

  const items: any[] = Array.isArray(data) ? data : data?.items ?? [];

  return (
    <div>
      <PublicNavbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-800">Portfolio</h1>
        <p className="text-sm text-slate-500 mt-1">Teaching materials, projects, and academic work.</p>

        {loading && !data ? (
          <div className="mt-10 flex justify-center">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState text="No portfolio items yet." />
        ) : (
          <div className="grid md:grid-cols-3 gap-5 mt-8">
            {items.map((item, i) => (
              <Card key={item.uuid ?? i} className="p-5">
                <p className="font-medium text-slate-800">{item.title}</p>
                <p className="text-sm text-slate-500 mt-2 line-clamp-4">{item.description}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

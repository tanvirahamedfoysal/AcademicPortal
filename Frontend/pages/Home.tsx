import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PublicNavbar from "../components/PublicNavbar";
import { ArticlesAPI, CollaboratorsAPI } from "../lib/api";
import { cachedFetch } from "../lib/cache";
import CachedImage from "../components/CachedImage";
import { Card, EmptyState } from "../components/ui";

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);

  useEffect(() => {
    cachedFetch("public:articles:home", () => ArticlesAPI.listPublic(), {
      onCache: (d: any) => setArticles(d?.data ?? []),
    }).then((d: any) => setArticles(d?.data ?? []));

    cachedFetch("public:collaborators:home", () => CollaboratorsAPI.list(), {
      onCache: (d: any) => setCollaborators(d?.data ?? []),
    }).then((d: any) => setCollaborators(d?.data ?? []));
  }, []);

  return (
    <div>
      <PublicNavbar />

      <section className="bg-gradient-to-b from-brand-50 to-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            A shared home for research, teaching, and collaboration
          </h1>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
            Browse published research, meet the lab's researchers and collaborators, and explore the academic
            portfolio — all in one place.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/articles" className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700">
              Browse articles
            </Link>
            <Link to="/register" className="border border-slate-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50">
              Join as a student
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Latest research</h2>
          <Link to="/articles" className="text-sm text-brand-700 font-medium">
            View all →
          </Link>
        </div>
        {articles.length === 0 ? (
          <EmptyState text="No published articles yet." />
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {articles.slice(0, 3).map((a) => (
              <Link key={a.uuid ?? a.id} to={`/articles/${a.uuid ?? a.id}`}>
                <Card className="p-5 h-full hover:shadow-md transition-shadow">
                  <p className="font-semibold text-slate-800 line-clamp-2">{a.title}</p>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-3">{a.summary ?? a.abstract ?? ""}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Collaborators</h2>
        {collaborators.length === 0 ? (
          <EmptyState text="No collaborators listed yet." />
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {collaborators.slice(0, 8).map((c) => (
              <Card key={c.uuid} className="p-4 text-center">
                <CachedImage
                  src={c.image_url}
                  updatedAt={c.updated_at}
                  alt={c.name}
                  className="h-16 w-16 rounded-full mx-auto object-cover"
                />
                <p className="mt-3 text-sm font-medium text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-400">{c.designation ?? c.role ?? ""}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

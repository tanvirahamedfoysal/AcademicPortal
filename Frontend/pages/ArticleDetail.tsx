import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { ArticlesAPI } from "../lib/api";
import { cachedFetch } from "../lib/cache";
import { Spinner } from "../components/ui";

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    cachedFetch(`public:article:${id}`, () => ArticlesAPI.getPublic(id), {
      onCache: (d: any) => setArticle(d?.data ?? d),
    })
      .then((d: any) => setArticle(d?.data ?? d))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/articles" className="text-sm text-brand-700">
          ← Back to articles
        </Link>
        {loading && !article ? (
          <div className="mt-10 flex justify-center">
            <Spinner />
          </div>
        ) : article ? (
          <article className="mt-6">
            <h1 className="text-2xl font-semibold text-slate-800">{article.title}</h1>
            {article.published_at && (
              <p className="text-xs text-slate-400 mt-2">{new Date(article.published_at).toLocaleDateString()}</p>
            )}
            <div className="mt-6 text-slate-600 whitespace-pre-wrap leading-relaxed">
              {article.content ?? article.body ?? article.summary}
            </div>
          </article>
        ) : (
          <p className="mt-10 text-center text-slate-400">Article not found.</p>
        )}
      </div>
    </div>
  );
}

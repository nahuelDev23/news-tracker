import DeleteFakeNewsButton from "@/components/DeleteFakeNewsButton";
import { formatTableDate } from "@/lib/format-date";
import type { FakeNewsArticleSummary } from "@/types/fake-news";

interface FakeNewsArticlesTableProps {
  articles: FakeNewsArticleSummary[];
}

export default function FakeNewsArticlesTable({
  articles,
}: FakeNewsArticlesTableProps) {
  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">
        Todavía no hay noticias generadas. Creá la primera con el formulario de arriba.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                Título
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                Cambios aplicados
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                Enlace
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                Creado
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-slate-900/50">
                <td className="max-w-xs px-4 py-3">
                  <div className="truncate font-medium text-white" title={article.title}>
                    {article.title}
                  </div>
                  {article.summary && (
                    <div
                      className="mt-1 line-clamp-2 text-xs text-slate-500"
                      title={article.summary}
                    >
                      {article.summary}
                    </div>
                  )}
                </td>
                <td className="max-w-xs px-4 py-3">
                  <div
                    className="line-clamp-2 text-slate-400"
                    title={article.changesPrompt}
                  >
                    {article.changesPrompt}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={article.newsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-mono text-amber-400 hover:text-amber-300"
                  >
                    {article.newsUrl}
                  </a>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                  {formatTableDate(article.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <DeleteFakeNewsButton id={article.id} title={article.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

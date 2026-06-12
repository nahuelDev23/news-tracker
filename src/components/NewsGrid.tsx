import type { NewsArticle } from "@/types/news";
import NewsCard from "./NewsCard";

interface NewsGridProps {
  articles: NewsArticle[];
  categoryLabel: string;
}

export default function NewsGrid({ articles, categoryLabel }: NewsGridProps) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 py-20 text-center">
        <p className="text-lg font-medium text-slate-300">
          No hay noticias disponibles en {categoryLabel}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Intenta otra categoría o vuelve más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}

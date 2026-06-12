import { fetchGoogleNews } from "@/lib/google-news";
import type { Category } from "@/types/news";
import NewsGrid from "./NewsGrid";

interface NewsPageContentProps {
  category: Category;
}

export default async function NewsPageContent({ category }: NewsPageContentProps) {
  let articles: Awaited<ReturnType<typeof fetchGoogleNews>> = [];

  try {
    articles = await fetchGoogleNews(category.feedUrl);
  } catch {
    articles = [];
  }

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-500">
          Sección
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {category.label}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          {articles.length} noticias agregadas desde Google News en tiempo real.
        </p>
      </div>
      <NewsGrid articles={articles} categoryLabel={category.label} />
    </section>
  );
}

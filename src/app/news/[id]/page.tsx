import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildFakeNewsShareMetadata } from "@/lib/fake-news-og";
import { getFakeNewsArticleById } from "@/lib/fake-news";
import { buildNewsImageUrl } from "@/lib/news-url";
import { getDefaultOgImageUrl } from "@/lib/redirect-og";
import { formatNewsDate } from "@/lib/format-date";

interface NewsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: NewsPageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getFakeNewsArticleById(id);

  if (!article) {
    return { title: "Noticia no encontrada" };
  }

  return buildFakeNewsShareMetadata(article);
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { id } = await params;
  const article = await getFakeNewsArticleById(id);

  if (!article) {
    notFound();
  }

  const imageUrl = article.imageStoredName
    ? buildNewsImageUrl(article.imageStoredName)
    : getDefaultOgImageUrl();

  const paragraphs = article.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-950 px-4 py-16">
      <article className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={article.title}
          className="aspect-[16/10] w-full object-cover"
        />
        <div className="space-y-6 p-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium uppercase tracking-widest text-amber-500">
              Notipip
            </p>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-500/20 text-amber-400">
              beta
            </span>
          </div>

          <time
            dateTime={article.createdAt.toISOString()}
            className="block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            {formatNewsDate(article.createdAt.toISOString())}
          </time>

          <h1 className="text-3xl font-bold leading-tight text-white">
            {article.title}
          </h1>

          {article.summary && (
            <p className="text-lg leading-relaxed text-slate-300">
              {article.summary}
            </p>
          )}

          <div className="space-y-4 border-t border-slate-800 pt-6">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-slate-300">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

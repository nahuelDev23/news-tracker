import type { NewsArticle } from "@/types/news";
import { formatNewsDate } from "@/lib/format-date";

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5">
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
          {article.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-amber-950/40">
              <span className="text-4xl font-black text-amber-500/30">N</span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-medium text-amber-400 backdrop-blur-sm">
            {article.source}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <time
            dateTime={article.pubDate}
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            {formatNewsDate(article.pubDate)}
          </time>
          <h2 className="line-clamp-3 text-base font-semibold leading-snug text-white group-hover:text-amber-400">
            {article.title}
          </h2>
          {article.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
              {article.description}
            </p>
          )}
        </div>
      </a>
    </article>
  );
}

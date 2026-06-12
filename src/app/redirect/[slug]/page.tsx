import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import {
  buildRedirectShareMetadata,
  ensureRedirectOgMetadata,
  getDefaultOgImageUrl,
} from "@/lib/redirect-og";
import {
  getRedirectLinkBySlug,
  processRedirectHitInBackground,
} from "@/lib/redirects";
import { serializeFromHeaders } from "@/lib/request-info";
import { isSocialCrawler } from "@/lib/social-crawler";

interface RedirectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RedirectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const link = await getRedirectLinkBySlug(slug);

  if (!link) {
    return { title: "Enlace no encontrado" };
  }

  const withOg = await ensureRedirectOgMetadata(link);
  return buildRedirectShareMetadata(withOg);
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { slug } = await params;
  const link = await getRedirectLinkBySlug(slug);

  if (!link) {
    notFound();
  }

  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const withOg = await ensureRedirectOgMetadata(link);

  if (!isSocialCrawler(userAgent)) {
    const context = serializeFromHeaders(headersList);

    after(async () => {
      try {
        await processRedirectHitInBackground(withOg.id, context);
      } catch (error) {
        console.error("Error registrando redirect hit:", error);
      }
    });

    redirect(withOg.originalUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16">
      <article className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
        {(withOg.ogImageUrl ?? getDefaultOgImageUrl()) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={withOg.ogImageUrl ?? getDefaultOgImageUrl()}
            alt={withOg.ogTitle ?? "Portada de la noticia"}
            className="aspect-[16/10] w-full object-cover"
          />
        )}
        <div className="space-y-4 p-8">
          <p className="text-sm font-medium uppercase tracking-widest text-amber-500">
            Notipip
          </p>
          <h1 className="text-2xl font-bold text-white">
            {withOg.ogTitle ?? "Noticia en Notipip"}
          </h1>
          {withOg.ogDescription && (
            <p className="text-slate-400">{withOg.ogDescription}</p>
          )}
          <a
            href={withOg.originalUrl}
            className="inline-flex rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Leer noticia completa
          </a>
        </div>
      </article>
    </div>
  );
}

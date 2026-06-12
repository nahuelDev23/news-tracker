import { fetchOgMetadata, isWeakTitle } from "@/lib/og-metadata";
import { buildRedirectUrl, getAppBaseUrl } from "@/lib/redirect-url";
import { prisma } from "@/lib/prisma";

interface RedirectLinkOgSource {
  id: string;
  slug: string;
  originalUrl: string;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
}

export function getDefaultOgImageUrl(): string {
  return `${getAppBaseUrl()}/notipip-og.svg`;
}

function needsOgRefresh(link: RedirectLinkOgSource): boolean {
  return (
    isWeakTitle(link.ogTitle) ||
    !link.ogDescription?.trim() ||
    !link.ogImageUrl?.trim()
  );
}

function mergeOgField(
  current: string | null,
  next: string | null,
  weak?: (value: string | null | undefined) => boolean,
): string | null {
  const isWeak = weak ?? (() => false);
  if (next && (!current || isWeak(current))) return next;
  return current ?? next;
}

export async function ensureRedirectOgMetadata(
  link: RedirectLinkOgSource,
): Promise<RedirectLinkOgSource> {
  if (!needsOgRefresh(link)) {
    return link;
  }

  const og = await fetchOgMetadata(link.originalUrl);

  const updated = await prisma.redirectLink.update({
    where: { id: link.id },
    data: {
      ogTitle: mergeOgField(link.ogTitle, og.title, isWeakTitle),
      ogDescription: mergeOgField(link.ogDescription, og.description),
      ogImageUrl: mergeOgField(link.ogImageUrl, og.imageUrl),
    },
  });

  return updated;
}

export function buildRedirectShareMetadata(link: RedirectLinkOgSource) {
  const shareUrl = buildRedirectUrl(link.slug);
  const title = link.ogTitle ?? "Noticia en Notipip";
  const description =
    link.ogDescription ?? "Lee esta noticia de Ecuador en Notipip.";
  const image = link.ogImageUrl ?? getDefaultOgImageUrl();

  return {
    title,
    description,
    metadataBase: new URL(getAppBaseUrl()),
    alternates: {
      canonical: shareUrl,
    },
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: "Notipip",
      locale: "es_EC",
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [image],
    },
  };
}

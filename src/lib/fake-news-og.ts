import { getDefaultOgImageUrl } from "@/lib/redirect-og";
import { getAppBaseUrl } from "@/lib/redirect-url";
import { buildNewsImageUrl, buildNewsUrl } from "@/lib/news-url";

interface FakeNewsOgSource {
  id: string;
  title: string;
  summary: string | null;
  imageStoredName: string | null;
}

export function buildFakeNewsShareMetadata(article: FakeNewsOgSource) {
  const shareUrl = buildNewsUrl(article.id);
  const title = article.title;
  const description =
    article.summary?.trim() ||
    "Noticia de Ecuador en Notipip.";
  const image = article.imageStoredName
    ? buildNewsImageUrl(article.imageStoredName)
    : getDefaultOgImageUrl();

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

import {
  decodeGoogleNewsUrl,
  isGoogleNewsArticleUrl,
  resolveArticleUrl,
} from "@/lib/google-news-url";

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractMeta(html: string, key: string): string | undefined {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }

  return undefined;
}

function resolveImageUrl(
  image: string | undefined,
  pageUrl: string,
): string | undefined {
  if (!image) return undefined;

  try {
    return new URL(image, pageUrl).href;
  } catch {
    return undefined;
  }
}

function upgradeGoogleImageUrl(imageUrl: string): string {
  if (!imageUrl.includes("googleusercontent.com")) {
    return imageUrl;
  }

  return imageUrl.replace(/=s0-w\d+/i, "=s0-w1200").replace(/=w\d+-h\d+/i, "=w1200-h630");
}

function extractJsonLdMetadata(html: string): Partial<OgMetadata> {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const match of scripts) {
    try {
      const parsed = JSON.parse(match[1].trim()) as unknown;
      const nodes = Array.isArray(parsed)
        ? parsed
        : typeof parsed === "object" && parsed !== null && "@graph" in parsed
          ? ((parsed as { "@graph": unknown[] })["@graph"] ?? [parsed])
          : [parsed];

      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;

        const record = node as Record<string, unknown>;
        const type = record["@type"];
        const types = Array.isArray(type) ? type : type ? [type] : [];
        const isArticle = types.some((value) =>
          /NewsArticle|Article|WebPage/i.test(String(value)),
        );

        if (!isArticle) continue;

        const image = record.image;
        let imageUrl: string | null = null;

        if (typeof image === "string") {
          imageUrl = image;
        } else if (Array.isArray(image)) {
          const first = image[0];
          imageUrl =
            typeof first === "string"
              ? first
              : typeof first === "object" && first && "url" in first
                ? String((first as { url: string }).url)
                : null;
        } else if (image && typeof image === "object" && "url" in image) {
          imageUrl = String((image as { url: string }).url);
        }

        return {
          title:
            typeof record.headline === "string"
              ? record.headline
              : typeof record.name === "string"
                ? record.name
                : null,
          description:
            typeof record.description === "string" ? record.description : null,
          imageUrl,
        };
      }
    } catch {
      // JSON-LD inválido en algunos medios
    }
  }

  return {};
}

const USER_AGENTS = [
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
];

export interface OgMetadata {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
}

function isWeakTitle(title: string | null | undefined): boolean {
  if (!title) return true;

  const normalized = title.trim().toLowerCase();
  return (
    normalized.length < 3 ||
    normalized === "google news" ||
    normalized === "noticia en notipip"
  );
}

function pickField(
  current: string | null | undefined,
  next: string | null | undefined,
  weak?: (value: string | null | undefined) => boolean,
): string | null {
  const isWeak = weak ?? (() => false);
  if (next && (!current || isWeak(current))) return next;
  return current ?? next ?? null;
}

async function fetchHtml(pageUrl: string): Promise<{
  html: string;
  finalUrl: string;
} | null> {
  for (const userAgent of USER_AGENTS) {
    try {
      const response = await fetch(pageUrl, {
        headers: {
          "User-Agent": userAgent,
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 3600 },
      });

      if (!response.ok) continue;

      return {
        html: (await response.text()).slice(0, 250_000),
        finalUrl: response.url || pageUrl,
      };
    } catch {
      // probar siguiente user-agent
    }
  }

  return null;
}

function parseOgFromHtml(html: string, pageUrl: string): OgMetadata {
  const jsonLd = extractJsonLdMetadata(html);

  const title =
    extractMeta(html, "og:title") ??
    extractMeta(html, "twitter:title") ??
    jsonLd.title ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
    null;

  const description =
    extractMeta(html, "og:description") ??
    extractMeta(html, "twitter:description") ??
    extractMeta(html, "description") ??
    jsonLd.description ??
    null;

  const imageUrl = resolveImageUrl(
    extractMeta(html, "og:image:secure_url") ??
      extractMeta(html, "og:image") ??
      extractMeta(html, "og:image:url") ??
      extractMeta(html, "twitter:image") ??
      jsonLd.imageUrl ??
      undefined,
    pageUrl,
  );

  return {
    title: title ? decodeHtmlEntities(title) : null,
    description: description ? decodeHtmlEntities(description) : null,
    imageUrl: imageUrl ? upgradeGoogleImageUrl(imageUrl) : null,
  };
}

async function fetchGoogleNewsFallback(
  googleNewsUrl: string,
): Promise<OgMetadata> {
  const fetched = await fetchHtml(googleNewsUrl);
  if (!fetched) {
    return { title: null, description: null, imageUrl: null };
  }

  return parseOgFromHtml(fetched.html, fetched.finalUrl);
}

export async function fetchOgMetadata(pageUrl: string): Promise<OgMetadata> {
  try {
    const resolvedUrl = await resolveArticleUrl(pageUrl);
    const fetched = await fetchHtml(resolvedUrl);

    if (!fetched) {
      if (isGoogleNewsArticleUrl(pageUrl)) {
        return fetchGoogleNewsFallback(pageUrl);
      }

      return { title: null, description: null, imageUrl: null };
    }

    const metadata = parseOgFromHtml(fetched.html, fetched.finalUrl);

    if (
      isGoogleNewsArticleUrl(pageUrl) &&
      (isWeakTitle(metadata.title) || !metadata.description || !metadata.imageUrl)
    ) {
      const fallback = await fetchGoogleNewsFallback(pageUrl);
      return {
        title: pickField(metadata.title, fallback.title, isWeakTitle),
        description: pickField(metadata.description, fallback.description),
        imageUrl: pickField(metadata.imageUrl, fallback.imageUrl),
      };
    }

    return metadata;
  } catch {
    return { title: null, description: null, imageUrl: null };
  }
}

export { isWeakTitle, isGoogleNewsArticleUrl, decodeGoogleNewsUrl, resolveArticleUrl };

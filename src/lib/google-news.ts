import { XMLParser } from "fast-xml-parser";
import type { NewsArticle } from "@/types/news";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

interface RssItem {
  title?: string;
  link?: string;
  guid?: string | { "#text"?: string };
  pubDate?: string;
  description?: string;
  source?: string | { "#text"?: string; "@_url"?: string };
}

function asText(value: string | { "#text"?: string } | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  return value["#text"];
}

function extractImage(html?: string): string | undefined {
  if (!html) return undefined;
  const match = html.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1];
}

function extractSource(item: RssItem): string {
  const source = asText(item.source);
  if (source) return source;

  const title = item.title ?? "";
  const dashIndex = title.lastIndexOf(" - ");
  if (dashIndex !== -1) return title.slice(dashIndex + 3).trim();
  return "Google News";
}

function stripHtml(html?: string): string | undefined {
  if (!html) return undefined;
  return html.replace(/<[^>]*>/g, "").trim();
}

function normalizeItems(raw: RssItem | RssItem[] | undefined): RssItem[] {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

export async function fetchGoogleNews(feedUrl: string): Promise<NewsArticle[]> {
  const response = await fetch(feedUrl, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "User-Agent": "Notipip/1.0",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener noticias: ${response.status}`);
  }

  const xml = await response.text();
  const parsed = xmlParser.parse(xml) as {
    rss?: { channel?: { item?: RssItem | RssItem[] } };
  };

  const items = normalizeItems(parsed.rss?.channel?.item);

  return items.map((item, index) => {
    const description = stripHtml(item.description);
    const image = extractImage(item.description);
    const guid = asText(item.guid);

    return {
      id: guid ?? item.link ?? `${feedUrl}-${index}`,
      title: (item.title ?? "Sin título").replace(/ - [^-]+$/, "").trim(),
      link: item.link ?? "#",
      pubDate: item.pubDate ?? new Date().toISOString(),
      source: extractSource(item),
      image,
      description,
    };
  });
}

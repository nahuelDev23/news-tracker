import type { Category } from "@/types/news";

const LOCALE = "hl=es-EC&gl=EC&ceid=EC:es";
const BASE = "https://news.google.com/rss";

function searchFeed(query: string): string {
  return `${BASE}/search?q=${encodeURIComponent(query)}&${LOCALE}`;
}

export const categories: Category[] = [
  {
    slug: "portada",
    label: "Portada",
    feedUrl: searchFeed("Ecuador"),
  },
  {
    slug: "politica",
    label: "Política",
    feedUrl: searchFeed("política Ecuador"),
  },
  {
    slug: "tecnologia",
    label: "Tecnología",
    feedUrl: searchFeed("tecnología Ecuador"),
  },
  {
    slug: "policia",
    label: "Policía",
    feedUrl: searchFeed("policía sucesos Ecuador"),
  },
  {
    slug: "economia",
    label: "Economía",
    feedUrl: searchFeed("economía Ecuador"),
  },
  {
    slug: "deportes",
    label: "Deportes",
    feedUrl: searchFeed("deportes Ecuador OR selección Ecuador"),
  },
  {
    slug: "ciencia",
    label: "Ciencia",
    feedUrl: searchFeed("ciencia Ecuador"),
  },
  {
    slug: "salud",
    label: "Salud",
    feedUrl: searchFeed("salud Ecuador"),
  },
  {
    slug: "entretenimiento",
    label: "Entretenimiento",
    feedUrl: searchFeed("entretenimiento Ecuador"),
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export const defaultCategory = categories[0];

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  image?: string;
  description?: string;
}

export interface Category {
  slug: string;
  label: string;
  feedUrl: string;
}

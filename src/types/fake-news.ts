export interface FakeNewsArticleSummary {
  id: string;
  title: string;
  summary: string | null;
  changesPrompt: string;
  newsUrl: string;
  imageUrl: string | null;
  createdAt: string;
}

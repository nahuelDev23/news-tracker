import { getAppBaseUrl } from "@/lib/redirect-url";

export function buildNewsUrl(id: string): string {
  return `${getAppBaseUrl()}/news/${id}`;
}

export function buildNewsImageUrl(storedName: string): string {
  return `${getAppBaseUrl()}/api/news/images/${encodeURIComponent(storedName)}`;
}

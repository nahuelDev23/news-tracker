import { randomBytes } from "crypto";

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  const url = new URL(withProtocol);
  return url.href;
}

export function generateSlugFromUrl(url: string): string {
  const parsed = new URL(url);
  const segments = parsed.pathname.split("/").filter(Boolean);
  const lastSegment = segments.at(-1) ?? parsed.hostname.replace(/\./g, "-");

  const base = lastSegment
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 48);

  const suffix = randomBytes(3).toString("hex");
  return `${base || "noticia"}-${suffix}`;
}

function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const port = process.env.APP_PORT?.trim();
  const hostWithPort = port ? `${trimmed}:${port}` : trimmed;

  return `http://${hostWithPort}`;
}

export function getAppBaseUrl(): string {
  const fromEnv =
    process.env.NGROK_URL ?? process.env.APP_URL ?? process.env.APP_HOST;

  if (!fromEnv) {
    throw new Error(
      "Define NGROK_URL o APP_URL en .env (ej: NGROK_URL=https://tu-tunel.ngrok-free.app).",
    );
  }

  return normalizeBaseUrl(fromEnv);
}

export function buildRedirectUrl(slug: string): string {
  return `${getAppBaseUrl()}/redirect/${slug}`;
}

export function buildDownloadUrl(slug: string): string {
  return `${getAppBaseUrl()}/d/${slug}`;
}

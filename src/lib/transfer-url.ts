import { randomBytes } from "crypto";
import { buildDownloadUrl } from "@/lib/redirect-url";

export { buildDownloadUrl };

export function generateTransferSlug(originalName: string): string {
  const base = originalName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 48);

  const suffix = randomBytes(3).toString("hex");
  return `${base || "archivo"}-${suffix}`;
}

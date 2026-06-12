import { createReadStream } from "fs";
import { mkdir, writeFile, unlink, stat } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export function getStorageDir(): string {
  const configured = process.env.STORAGE_PATH?.trim();
  const storageDir = configured
    ? path.resolve(process.cwd(), configured)
    : path.resolve(process.cwd(), "storage", "uploads");

  return storageDir;
}

export function getMaxUploadBytes(): number {
  const raw = process.env.MAX_UPLOAD_BYTES?.trim();
  const parsed = raw ? Number(raw) : 100 * 1024 * 1024;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 100 * 1024 * 1024;
}

export async function ensureStorageDir(): Promise<string> {
  const dir = getStorageDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

function sanitizeOriginalName(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200) || "archivo";
}

export function buildStoredName(originalName: string): string {
  const safeName = sanitizeOriginalName(originalName);
  const suffix = randomBytes(8).toString("hex");
  return `${suffix}-${safeName}`;
}

export async function saveUploadedFile(
  file: File,
): Promise<{ storedName: string; originalName: string; mimeType: string; sizeBytes: number }> {
  const maxBytes = getMaxUploadBytes();

  if (file.size > maxBytes) {
    throw new Error(`El archivo supera el límite de ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  }

  const storageDir = await ensureStorageDir();
  const originalName = sanitizeOriginalName(file.name || "archivo");
  const storedName = buildStoredName(originalName);
  const absolutePath = path.join(storageDir, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    storedName,
    originalName,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  };
}

export function getFileAbsolutePath(storedName: string): string {
  const storageDir = getStorageDir();
  const resolved = path.resolve(storageDir, storedName);
  const relative = path.relative(storageDir, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Ruta de archivo inválida.");
  }

  return resolved;
}

export async function fileExists(storedName: string): Promise<boolean> {
  try {
    await stat(getFileAbsolutePath(storedName));
    return true;
  } catch {
    return false;
  }
}

export function createFileReadStream(storedName: string) {
  return createReadStream(getFileAbsolutePath(storedName));
}

export async function deleteStoredFile(storedName: string): Promise<void> {
  try {
    await unlink(getFileAbsolutePath(storedName));
  } catch {
    // El archivo ya no existe en disco.
  }
}

const NEWS_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const NEWS_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function getNewsStorageDir(): string {
  return path.join(getStorageDir(), "news");
}

export async function ensureNewsStorageDir(): Promise<string> {
  const dir = getNewsStorageDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

export function getNewsImageAbsolutePath(storedName: string): string {
  const newsDir = getNewsStorageDir();
  const resolved = path.resolve(newsDir, storedName);
  const relative = path.relative(newsDir, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Ruta de imagen inválida.");
  }

  return resolved;
}

export async function newsImageExists(storedName: string): Promise<boolean> {
  try {
    await stat(getNewsImageAbsolutePath(storedName));
    return true;
  } catch {
    return false;
  }
}

export function createNewsImageReadStream(storedName: string) {
  return createReadStream(getNewsImageAbsolutePath(storedName));
}

export async function saveNewsImage(
  file: File,
): Promise<{ storedName: string; mimeType: string; sizeBytes: number }> {
  if (file.size > NEWS_IMAGE_MAX_BYTES) {
    throw new Error("La imagen supera el límite de 10 MB.");
  }

  const mimeType = file.type || "application/octet-stream";
  if (!NEWS_IMAGE_TYPES.has(mimeType)) {
    throw new Error("Formato de imagen no soportado. Usá JPG, PNG, WebP o GIF.");
  }

  const newsDir = await ensureNewsStorageDir();
  const originalName = sanitizeOriginalName(file.name || "imagen.jpg");
  const storedName = buildStoredName(originalName);
  const absolutePath = path.join(newsDir, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    storedName,
    mimeType,
    sizeBytes: file.size,
  };
}

export async function deleteNewsImage(storedName: string): Promise<void> {
  try {
    await unlink(getNewsImageAbsolutePath(storedName));
  } catch {
    // La imagen ya no existe en disco.
  }
}

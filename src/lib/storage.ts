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

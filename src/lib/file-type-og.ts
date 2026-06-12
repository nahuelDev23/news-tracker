const EXTENSION_OG_ASSETS: Record<string, string> = {
  zip: "zip",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  tgz: "archive",
  bz2: "archive",
  xz: "archive",
  doc: "word",
  docx: "word",
  odt: "word",
  pdf: "pdf",
  xls: "excel",
  xlsx: "excel",
  csv: "excel",
  ods: "excel",
  ppt: "powerpoint",
  pptx: "powerpoint",
  odp: "powerpoint",
  txt: "text",
  md: "text",
  rtf: "text",
  mp4: "video",
  mov: "video",
  avi: "video",
  webm: "video",
  mkv: "video",
  m4v: "video",
  mp3: "audio",
  wav: "audio",
  flac: "audio",
  aac: "audio",
  ogg: "audio",
  m4a: "audio",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  bmp: "image",
  svg: "image",
};

const MIME_OG_ASSETS: Record<string, string> = {
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "application/x-rar-compressed": "archive",
  "application/vnd.rar": "archive",
  "application/x-7z-compressed": "archive",
  "application/x-tar": "archive",
  "application/gzip": "archive",
  "application/pdf": "pdf",
  "application/msword": "word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "word",
  "application/vnd.oasis.opendocument.text": "word",
  "application/vnd.ms-excel": "excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "excel",
  "text/csv": "excel",
  "application/vnd.oasis.opendocument.spreadsheet": "excel",
  "application/vnd.ms-powerpoint": "powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "powerpoint",
  "application/vnd.oasis.opendocument.presentation": "powerpoint",
  "text/plain": "text",
  "text/markdown": "text",
  "application/rtf": "text",
  "text/rtf": "text",
  "video/mp4": "video",
  "video/quicktime": "video",
  "video/x-msvideo": "video",
  "video/webm": "video",
  "video/x-matroska": "video",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "audio/x-wav": "audio",
  "audio/flac": "audio",
  "audio/aac": "audio",
  "audio/ogg": "audio",
  "audio/mp4": "audio",
};

export function getFileExtension(fileName: string): string {
  const match = fileName.trim().match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : "";
}

export function resolveOgAssetKey(
  originalName: string,
  mimeType: string,
): string {
  const extension = getFileExtension(originalName);
  if (extension && EXTENSION_OG_ASSETS[extension]) {
    return EXTENSION_OG_ASSETS[extension];
  }

  const normalizedMime = mimeType.trim().toLowerCase();
  if (normalizedMime && MIME_OG_ASSETS[normalizedMime]) {
    return MIME_OG_ASSETS[normalizedMime];
  }

  return "default";
}

export function getOgAssetPath(assetKey: string): string {
  return `/api/og/${assetKey}`;
}

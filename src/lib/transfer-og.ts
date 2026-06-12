import {
  getOgAssetPath,
  resolveOgAssetKey,
} from "@/lib/file-type-og";
import { buildDownloadUrl, getAppBaseUrl } from "@/lib/redirect-url";

export interface TransferOgSource {
  slug: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  label: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageMimeType(mimeType: string): boolean {
  return /^image\/(jpeg|jpg|png|gif|webp|bmp)$/i.test(mimeType);
}

export function getDefaultOgImageUrl(): string {
  return `${getAppBaseUrl()}${getOgAssetPath("default")}`;
}

export function getTransferTypeOgImageUrl(
  originalName: string,
  mimeType: string,
): string {
  const assetKey = resolveOgAssetKey(originalName, mimeType);
  return `${getAppBaseUrl()}${getOgAssetPath(assetKey)}`;
}

export function getTransferOgImageUrl(transfer: TransferOgSource): string {
  if (isImageMimeType(transfer.mimeType)) {
    return `${getAppBaseUrl()}/api/og/preview/${transfer.slug}`;
  }

  return getTransferTypeOgImageUrl(transfer.originalName, transfer.mimeType);
}

export function getTransferPreviewImageUrl(transfer: TransferOgSource): string {
  return getTransferOgImageUrl(transfer);
}

export function getTransferOgTitle(transfer: TransferOgSource): string {
  return transfer.label?.trim() || transfer.originalName;
}

export function getTransferOgDescription(transfer: TransferOgSource): string {
  return `Archivo de ${formatBytes(transfer.sizeBytes)} listo para descargar en Seetransfer.`;
}

export function buildTransferShareMetadata(transfer: TransferOgSource) {
  const shareUrl = buildDownloadUrl(transfer.slug);
  const title = getTransferOgTitle(transfer);
  const description = getTransferOgDescription(transfer);
  const image = getTransferOgImageUrl(transfer);

  return {
    title,
    description,
    metadataBase: new URL(getAppBaseUrl()),
    alternates: {
      canonical: shareUrl,
    },
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: "Seetransfer",
      locale: "es_ES",
      type: "website" as const,
      images: [
        {
          url: image,
          secureUrl: image,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
  };
}

export function buildTransferSharePreview(transfer: TransferOgSource) {
  return {
    title: getTransferOgTitle(transfer),
    description: getTransferOgDescription(transfer),
    imageUrl: getTransferPreviewImageUrl(transfer),
    downloadUrl: buildDownloadUrl(transfer.slug),
  };
}

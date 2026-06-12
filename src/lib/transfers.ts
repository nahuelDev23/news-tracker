import { after } from "next/server";
import { lookupGeoByIp } from "@/lib/geoip";
import { fetchPublicEgressIp } from "@/lib/public-ip";
import { prisma } from "@/lib/prisma";
import {
  collectRequestMetadata,
  normalizeIp,
  requestFromContext,
  type ClientMetadata,
  type SerializedRequestContext,
  isPrivateIp,
} from "@/lib/request-info";
import {
  buildDownloadUrl,
  generateTransferSlug,
} from "@/lib/transfer-url";
import {
  deleteStoredFile,
  saveUploadedFile,
} from "@/lib/storage";

export async function createTransferFromFile(
  file: File,
  options: {
    userId?: string | null;
    trackingEnabled: boolean;
    label?: string | null;
    targetNumber?: string;
  },
) {
  const saved = await saveUploadedFile(file);

  let slug = generateTransferSlug(saved.originalName);
  while (await prisma.transfer.findUnique({ where: { slug } })) {
    slug = generateTransferSlug(saved.originalName);
  }

  const transfer = await prisma.transfer.create({
    data: {
      slug,
      originalName: saved.originalName,
      storedName: saved.storedName,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
      trackingEnabled: options.trackingEnabled,
      label: options.label ?? null,
      targetNumber: options.targetNumber ?? "",
      userId: options.userId ?? null,
    },
  });

  return {
    ...transfer,
    downloadUrl: buildDownloadUrl(transfer.slug),
  };
}

export async function listTransfers(userId: string) {
  const transfers = await prisma.transfer.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { hits: true },
      },
    },
  });

  return transfers.map((transfer) => ({
    id: transfer.id,
    slug: transfer.slug,
    originalName: transfer.originalName,
    mimeType: transfer.mimeType,
    sizeBytes: transfer.sizeBytes,
    trackingEnabled: transfer.trackingEnabled,
    label: transfer.label,
    targetNumber: transfer.targetNumber,
    downloadUrl: buildDownloadUrl(transfer.slug),
    hitCount: transfer._count.hits,
    createdAt: transfer.createdAt.toISOString(),
  }));
}

export async function getTransferForUser(id: string, userId: string) {
  return prisma.transfer.findFirst({
    where: { id, userId },
    include: {
      _count: {
        select: { hits: true },
      },
    },
  });
}

export async function getTransferBySlug(slug: string) {
  return prisma.transfer.findUnique({
    where: { slug },
  });
}

export async function deleteTransfer(id: string, userId: string) {
  const transfer = await prisma.transfer.findFirst({
    where: { id, userId },
    select: { id: true, storedName: true },
  });

  if (!transfer) return false;

  await prisma.transfer.delete({
    where: { id: transfer.id },
  });

  await deleteStoredFile(transfer.storedName);
  return true;
}

export async function listTransferHits(transferId: string) {
  const hits = await prisma.transferHit.findMany({
    where: { transferId },
    orderBy: { createdAt: "desc" },
  });

  return hits.map((hit) => ({
    id: hit.id,
    ipAddress: hit.ipAddress,
    internalIp: hit.internalIp,
    latitude: hit.latitude,
    longitude: hit.longitude,
    geoSource: hit.geoSource,
    country: hit.country,
    region: hit.region,
    city: hit.city,
    timezone: hit.timezone,
    isp: hit.isp,
    userAgent: hit.userAgent,
    acceptLanguage: hit.acceptLanguage,
    referer: hit.referer,
    platform: hit.platform,
    browser: hit.browser,
    deviceType: hit.deviceType,
    screenWidth: hit.screenWidth,
    screenHeight: hit.screenHeight,
    language: hit.language,
    timezoneClient: hit.timezoneClient,
    connectionType: hit.connectionType,
    createdAt: hit.createdAt.toISOString(),
  }));
}

async function resolvePublicIp(
  publicIp: string | null,
  internalIp: string | null,
): Promise<string | null> {
  if (publicIp && !isPrivateIp(publicIp)) {
    return normalizeIp(publicIp);
  }

  if (internalIp || publicIp) {
    return fetchPublicEgressIp();
  }

  return null;
}

async function enrichTransferHitWithGeo(
  hitId: string,
  publicIp: string | null,
  internalIp: string | null,
) {
  const resolvedPublicIp = await resolvePublicIp(publicIp, internalIp);
  const ipGeo = resolvedPublicIp ? await lookupGeoByIp(resolvedPublicIp) : null;

  await prisma.transferHit.update({
    where: { id: hitId },
    data: {
      ipAddress: resolvedPublicIp,
      latitude: ipGeo?.latitude ?? null,
      longitude: ipGeo?.longitude ?? null,
      geoSource: ipGeo ? "ip" : null,
      country: ipGeo?.country ?? null,
      region: ipGeo?.region ?? null,
      city: ipGeo?.city ?? null,
      timezone: ipGeo?.timezone ?? null,
      isp: ipGeo?.isp ?? null,
    },
  });
}

function buildTransferHitData(
  transferId: string,
  requestMeta: ReturnType<typeof collectRequestMetadata>,
  clientMeta?: ClientMetadata,
) {
  return {
    transferId,
    internalIp: requestMeta.internalIp ?? requestMeta.publicIp,
    userAgent: requestMeta.userAgent,
    acceptLanguage: requestMeta.acceptLanguage,
    acceptEncoding: requestMeta.acceptEncoding,
    referer: requestMeta.referer,
    platform: requestMeta.platform,
    browser: requestMeta.browser,
    deviceType: requestMeta.deviceType,
    screenWidth: clientMeta?.screenWidth ?? null,
    screenHeight: clientMeta?.screenHeight ?? null,
    language: clientMeta?.language ?? null,
    timezoneClient: clientMeta?.timezoneClient ?? null,
    connectionType: clientMeta?.connectionType ?? null,
  };
}

export async function registerTransferHit(
  transferId: string,
  context: SerializedRequestContext,
): Promise<string> {
  const request = requestFromContext(context);
  const requestMeta = collectRequestMetadata(request);

  const hit = await prisma.transferHit.create({
    data: buildTransferHitData(transferId, requestMeta),
  });

  after(async () => {
    try {
      await enrichTransferHitWithGeo(
        hit.id,
        requestMeta.publicIp,
        requestMeta.internalIp,
      );
    } catch (error) {
      console.error("Error enriqueciendo IP del hit:", error);
    }
  });

  return hit.id;
}

export async function processTransferHitInBackground(
  transferId: string,
  context: SerializedRequestContext,
  clientMeta?: ClientMetadata,
) {
  const request = requestFromContext(context);
  const requestMeta = collectRequestMetadata(request);

  const hit = await prisma.transferHit.create({
    data: buildTransferHitData(transferId, requestMeta, clientMeta),
  });

  await enrichTransferHitWithGeo(
    hit.id,
    requestMeta.publicIp,
    requestMeta.internalIp,
  );

  return hit.id;
}

export async function updateTransferHitClientMetadata(
  hitId: string,
  transferId: string,
  clientMeta: ClientMetadata,
) {
  const hit = await prisma.transferHit.findFirst({
    where: { id: hitId, transferId },
    select: { id: true },
  });

  if (!hit) return false;

  await prisma.transferHit.update({
    where: { id: hit.id },
    data: {
      screenWidth: clientMeta.screenWidth ?? null,
      screenHeight: clientMeta.screenHeight ?? null,
      language: clientMeta.language ?? null,
      timezoneClient: clientMeta.timezoneClient ?? null,
      connectionType: clientMeta.connectionType ?? null,
    },
  });

  return true;
}

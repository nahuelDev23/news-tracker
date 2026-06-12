import { lookupGeoByIp } from "@/lib/geoip";
import { fetchOgMetadata } from "@/lib/og-metadata";
import { fetchPublicEgressIp } from "@/lib/public-ip";
import { prisma } from "@/lib/prisma";
import {
  collectRequestMetadata,
  normalizeIp,
  requestFromContext,
  type SerializedRequestContext,
  isPrivateIp,
} from "@/lib/request-info";
import {
  buildRedirectUrl,
  generateSlugFromUrl,
  normalizeUrl,
} from "@/lib/redirect-url";

export async function createRedirectLink(
  userId: string,
  rawUrl: string,
  targetNumber: string,
) {
  const originalUrl = normalizeUrl(rawUrl);
  let slug = generateSlugFromUrl(originalUrl);

  while (await prisma.redirectLink.findUnique({ where: { slug } })) {
    slug = generateSlugFromUrl(originalUrl);
  }

  const og = await fetchOgMetadata(originalUrl);

  const link = await prisma.redirectLink.create({
    data: {
      slug,
      originalUrl,
      userId,
      targetNumber,
      ogTitle: og.title,
      ogDescription: og.description,
      ogImageUrl: og.imageUrl,
    },
  });

  return {
    ...link,
    redirectUrl: buildRedirectUrl(link.slug),
  };
}

export async function listRedirectLinks(userId: string) {
  const links = await prisma.redirectLink.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { hits: true },
      },
    },
  });

  return links.map((link) => ({
    id: link.id,
    slug: link.slug,
    originalUrl: link.originalUrl,
    label: link.label,
    targetNumber: link.targetNumber,
    redirectUrl: buildRedirectUrl(link.slug),
    hitCount: link._count.hits,
    createdAt: link.createdAt.toISOString(),
  }));
}

export async function getRedirectLinkForUser(id: string, userId: string) {
  return prisma.redirectLink.findFirst({
    where: { id, userId },
    include: {
      _count: {
        select: { hits: true },
      },
    },
  });
}

export async function deleteRedirectLink(id: string, userId: string) {
  const link = await prisma.redirectLink.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!link) return false;

  await prisma.redirectLink.delete({
    where: { id: link.id },
  });

  return true;
}

export async function getRedirectLinkBySlug(slug: string) {
  return prisma.redirectLink.findUnique({
    where: { slug },
  });
}

export async function listRedirectHits(redirectLinkId: string) {
  const hits = await prisma.redirectHit.findMany({
    where: { redirectLinkId },
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

export async function processRedirectHitInBackground(
  redirectLinkId: string,
  context: SerializedRequestContext,
) {
  const request = requestFromContext(context);
  const requestMeta = collectRequestMetadata(request);

  const hit = await prisma.redirectHit.create({
    data: {
      redirectLinkId,
      ipAddress: null,
      internalIp: requestMeta.internalIp ?? requestMeta.publicIp,
      userAgent: requestMeta.userAgent,
      acceptLanguage: requestMeta.acceptLanguage,
      acceptEncoding: requestMeta.acceptEncoding,
      referer: requestMeta.referer,
      platform: requestMeta.platform,
      browser: requestMeta.browser,
      deviceType: requestMeta.deviceType,
    },
  });

  const publicIp = await resolvePublicIp(
    requestMeta.publicIp,
    requestMeta.internalIp,
  );
  const ipGeo = publicIp ? await lookupGeoByIp(publicIp) : null;

  await prisma.redirectHit.update({
    where: { id: hit.id },
    data: {
      ipAddress: publicIp,
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

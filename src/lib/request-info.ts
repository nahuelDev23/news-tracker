import type { NextRequest } from "next/server";

export interface ClientIpInfo {
  internalIp: string | null;
  publicIp: string | null;
}

export function normalizeIp(ip: string): string {
  const trimmed = ip.trim().toLowerCase();

  if (trimmed.startsWith("::ffff:")) {
    return trimmed.slice(7);
  }

  return trimmed;
}

export function isPrivateIp(ip: string): boolean {
  const normalized = normalizeIp(ip);

  if (
    normalized === "::1" ||
    normalized === "127.0.0.1" ||
    normalized === "localhost"
  ) {
    return true;
  }

  if (
    normalized.startsWith("10.") ||
    normalized.startsWith("192.168.") ||
    normalized.startsWith("172.")
  ) {
    const secondOctet = Number(normalized.split(".")[1]);
    if (normalized.startsWith("172.") && secondOctet >= 16 && secondOctet <= 31) {
      return true;
    }
    if (normalized.startsWith("10.") || normalized.startsWith("192.168.")) {
      return true;
    }
  }

  return false;
}

function collectIpCandidates(request: Request | NextRequest): string[] {
  const candidates: string[] = [];

  const seenIp = request.headers.get("x-notipip-seen-ip");
  if (seenIp) candidates.push(seenIp);

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    candidates.push(...forwardedFor.split(",").map((part) => part.trim()));
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) candidates.push(realIp.trim());

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) candidates.push(cfConnectingIp.trim());

  const nextIp = (request as NextRequest & { ip?: string }).ip;
  if (nextIp) candidates.push(nextIp);

  return [...new Set(candidates.filter(Boolean))];
}

export function resolveClientIps(request: Request | NextRequest): ClientIpInfo {
  const candidates = collectIpCandidates(request).map(normalizeIp);

  let internalIp: string | null = null;
  let publicIp: string | null = null;

  for (const ip of candidates) {
    if (isPrivateIp(ip)) {
      internalIp ??= ip;
    } else {
      publicIp = ip;
      break;
    }
  }

  if (!internalIp && candidates[0]) {
    internalIp = candidates[0];
  }

  if (!publicIp && internalIp && !isPrivateIp(internalIp)) {
    publicIp = internalIp;
  }

  return { internalIp, publicIp };
}

export function getClientIp(request: Request | NextRequest): string | null {
  const { publicIp, internalIp } = resolveClientIps(request);
  return publicIp ?? internalIp;
}

export interface DeviceInfo {
  platform: string | null;
  browser: string | null;
  deviceType: "mobile" | "tablet" | "desktop" | "bot" | "unknown";
}

export function parseDeviceInfo(userAgent: string | null): DeviceInfo {
  if (!userAgent) {
    return { platform: null, browser: null, deviceType: "unknown" };
  }

  let deviceType: DeviceInfo["deviceType"] = "desktop";
  if (/bot|crawler|spider|slurp|facebookexternalhit/i.test(userAgent)) {
    deviceType = "bot";
  } else if (/ipad|tablet|kindle|playbook|silk/i.test(userAgent)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(userAgent)) {
    deviceType = "mobile";
  }

  let platform: string | null = null;
  if (/windows nt/i.test(userAgent)) platform = "Windows";
  else if (/mac os x/i.test(userAgent)) platform = "macOS";
  else if (/android/i.test(userAgent)) platform = "Android";
  else if (/iphone|ipad|ipod/i.test(userAgent)) platform = "iOS";
  else if (/linux/i.test(userAgent)) platform = "Linux";

  let browser: string | null = null;
  if (/edg\//i.test(userAgent)) browser = "Edge";
  else if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) browser = "Chrome";
  else if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) browser = "Safari";
  else if (/firefox\//i.test(userAgent)) browser = "Firefox";
  else if (/opr\//i.test(userAgent)) browser = "Opera";

  return { platform, browser, deviceType };
}

export function collectRequestMetadata(request: Request | NextRequest) {
  const userAgent = request.headers.get("user-agent");
  const device = parseDeviceInfo(userAgent);
  const ips = resolveClientIps(request);

  return {
    ...ips,
    userAgent,
    acceptLanguage: request.headers.get("accept-language"),
    acceptEncoding: request.headers.get("accept-encoding"),
    referer: request.headers.get("referer"),
    ...device,
  };
}

export interface SerializedRequestContext {
  headers: Record<string, string>;
}

export interface ClientMetadata {
  screenWidth?: number | null;
  screenHeight?: number | null;
  language?: string | null;
  timezoneClient?: string | null;
  connectionType?: string | null;
}

export function serializeFromHeaders(headersList: Headers): SerializedRequestContext {
  return {
    headers: Object.fromEntries(headersList.entries()),
  };
}

export function serializeRequestContext(
  request: Request | NextRequest,
): SerializedRequestContext {
  return {
    headers: Object.fromEntries(request.headers.entries()),
  };
}

export function requestFromContext(context: SerializedRequestContext): Request {
  return new Request("http://redirect.local/track", {
    headers: context.headers,
  });
}

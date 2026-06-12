import { isPrivateIp, normalizeIp } from "@/lib/request-info";

export interface GeoLookupResult {
  latitude: number;
  longitude: number;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  isp: string | null;
}

const GEO_TIMEOUT_MS = 4000;

export async function lookupGeoByIp(
  ip: string | null,
): Promise<GeoLookupResult | null> {
  const normalizedIp = ip ? normalizeIp(ip) : null;

  if (!normalizedIp || isPrivateIp(normalizedIp)) {
    return null;
  }

  try {
    const fields = [
      "status",
      "message",
      "lat",
      "lon",
      "country",
      "regionName",
      "city",
      "timezone",
      "isp",
    ].join(",");

    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(normalizedIp)}?fields=${fields}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(GEO_TIMEOUT_MS),
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      status?: string;
      lat?: number;
      lon?: number;
      country?: string;
      regionName?: string;
      city?: string;
      timezone?: string;
      isp?: string;
    };

    if (data.status !== "success" || data.lat == null || data.lon == null) {
      return null;
    }

    return {
      latitude: data.lat,
      longitude: data.lon,
      country: data.country ?? null,
      region: data.regionName ?? null,
      city: data.city ?? null,
      timezone: data.timezone ?? null,
      isp: data.isp ?? null,
    };
  } catch {
    return null;
  }
}

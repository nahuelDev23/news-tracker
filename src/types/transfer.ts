export interface TransferSummary {
  id: string;
  slug: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  trackingEnabled: boolean;
  label: string | null;
  targetNumber: string;
  downloadUrl: string;
  hitCount: number;
  createdAt: string;
}

export interface TransferHitRecord {
  id: string;
  ipAddress: string | null;
  internalIp: string | null;
  latitude: number | null;
  longitude: number | null;
  geoSource: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  isp: string | null;
  userAgent: string | null;
  acceptLanguage: string | null;
  referer: string | null;
  platform: string | null;
  browser: string | null;
  deviceType: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  language: string | null;
  timezoneClient: string | null;
  connectionType: string | null;
  createdAt: string;
}

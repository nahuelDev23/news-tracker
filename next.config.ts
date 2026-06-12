import type { NextConfig } from "next";

function parseList(value?: string): string[] {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

function originsFromNgrokUrl(): string[] {
  const ngrokUrl = process.env.NGROK_URL;
  if (!ngrokUrl) return [];

  try {
    const { hostname } = new URL(ngrokUrl);
    return [hostname];
  } catch {
    return [];
  }
}

const allowedDevOrigins = [
  "localhost",
  "127.0.0.1",
  "*.localhost",
  "192.168.*.*",
  "10.*.*.*",
  "172.*.*.*",
  "*.ngrok-free.app",
  "*.ngrok.io",
  "*.ngrok.app",
  ...originsFromNgrokUrl(),
  ...parseList(process.env.ALLOWED_DEV_ORIGINS),
];

const serverActionOrigins = [
  "localhost:*",
  "127.0.0.1:*",
  "192.168.*.*:*",
  "10.*.*.*:*",
  "172.*.*.*:*",
  "*.ngrok-free.app",
  "*.ngrok.io",
  "*.ngrok.app",
  ...originsFromNgrokUrl(),
  ...parseList(process.env.ALLOWED_ORIGINS),
];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  experimental: {
    serverActions: {
      allowedOrigins: serverActionOrigins,
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;

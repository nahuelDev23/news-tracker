const PUBLIC_IP_TIMEOUT_MS = 1500;

export async function fetchPublicEgressIp(): Promise<string | null> {
  try {
    const response = await fetch("https://api64.ipify.org?format=json", {
      cache: "no-store",
      signal: AbortSignal.timeout(PUBLIC_IP_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { ip?: string };
    return data.ip ?? null;
  } catch {
    return null;
  }
}

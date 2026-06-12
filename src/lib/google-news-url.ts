const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

export function isGoogleNewsArticleUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "news.google.com" &&
      parsed.pathname.includes("/articles/")
    );
  } catch {
    return false;
  }
}

function extractArticleId(url: string): string | null {
  const match = url.match(/\/articles\/([^/?]+)/);
  return match?.[1] ?? null;
}

function tryLegacyBase64Decode(articleId: string): string | null {
  try {
    let str = Buffer.from(articleId, "base64").toString("binary");
    const prefix = Buffer.from([0x08, 0x13, 0x22]).toString("binary");
    if (str.startsWith(prefix)) {
      str = str.slice(prefix.length);
    }

    const suffix = Buffer.from([0xd2, 0x01, 0x00]).toString("binary");
    if (str.endsWith(suffix)) {
      str = str.slice(0, -suffix.length);
    }

    const len = str.charCodeAt(0);
    str = len >= 0x80 ? str.slice(2, len + 2) : str.slice(1, len + 1);

    if (/^https?:\/\//i.test(str)) {
      return str;
    }
  } catch {
    // formato nuevo, requiere batchexecute
  }

  return null;
}

async function decodeViaBatchExecute(
  articleId: string,
  timestamp: string,
  signature: string,
): Promise<string | null> {
  const inner = `["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"${articleId}",${timestamp},"${signature}"]`;

  const payload = new URLSearchParams();
  payload.set("f.req", JSON.stringify([[["Fbv4je", inner, null, "generic"]]]));

  const response = await fetch(
    "https://news.google.com/_/DotsSplashUi/data/batchexecute",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": BROWSER_USER_AGENT,
      },
      body: payload.toString(),
      signal: AbortSignal.timeout(8000),
    },
  );

  if (!response.ok) return null;

  const text = (await response.text()).replace(/^\)\]\}'\n?/, "");
  const outer = JSON.parse(text) as unknown[];
  const innerParsed = JSON.parse(String((outer[0] as unknown[])[2])) as unknown[];
  const decodedUrl = innerParsed[1];

  return typeof decodedUrl === "string" && /^https?:\/\//i.test(decodedUrl)
    ? decodedUrl
    : null;
}

export async function decodeGoogleNewsUrl(
  googleNewsUrl: string,
): Promise<string | null> {
  const articleId = extractArticleId(googleNewsUrl);
  if (!articleId) return null;

  const legacy = tryLegacyBase64Decode(articleId);
  if (legacy) return legacy;

  try {
    const response = await fetch(googleNewsUrl, {
      headers: {
        "User-Agent": BROWSER_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const html = (await response.text()).slice(0, 200_000);
    const signature = html.match(/data-n-a-sg="([^"]+)"/)?.[1];
    const timestamp = html.match(/data-n-a-ts="([^"]+)"/)?.[1];
    const pageArticleId = html.match(/data-n-a-id="([^"]+)"/)?.[1] ?? articleId;

    if (!signature || !timestamp) return null;

    return decodeViaBatchExecute(pageArticleId, timestamp, signature);
  } catch {
    return null;
  }
}

export async function resolveArticleUrl(url: string): Promise<string> {
  if (!isGoogleNewsArticleUrl(url)) {
    return url;
  }

  const decoded = await decodeGoogleNewsUrl(url);
  return decoded ?? url;
}

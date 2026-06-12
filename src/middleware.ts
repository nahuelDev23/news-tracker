import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionSecretKey } from "@/lib/session-secret";
import { SESSION_COOKIE } from "@/lib/session";

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, getSessionSecretKey());
    return true;
  } catch {
    return false;
  }
}

function buildRequestHeaders(request: NextRequest, withSeenIp: boolean) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  if (withSeenIp) {
    const seenIp =
      request.headers.get("x-notipip-seen-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      (request as NextRequest & { ip?: string }).ip;

    if (seenIp) {
      requestHeaders.set("x-notipip-seen-ip", seenIp);
    }
  }

  return requestHeaders;
}

function continueWithHeaders(request: NextRequest, withSeenIp = false) {
  return NextResponse.next({
    request: { headers: buildRequestHeaders(request, withSeenIp) },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsSeenIp =
    pathname.startsWith("/redirect/") ||
    pathname.startsWith("/d/") ||
    pathname.startsWith("/api/files/");

  if (pathname.startsWith("/dashboard") || pathname === "/auth") {
    const authenticated = await isAuthenticated(request);

    if (pathname.startsWith("/dashboard") && !authenticated) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (pathname === "/auth" && authenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return continueWithHeaders(request, needsSeenIp);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

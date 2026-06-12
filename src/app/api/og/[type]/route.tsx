import { ImageResponse } from "next/og";
import { isValidOgType, renderOgContent } from "@/lib/og-render";

export const runtime = "edge";

interface RouteContext {
  params: Promise<{ type: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { type } = await context.params;

  if (!isValidOgType(type)) {
    return new Response("Tipo no soportado.", { status: 404 });
  }

  return new ImageResponse(renderOgContent(type), {
    width: 1200,
    height: 630,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

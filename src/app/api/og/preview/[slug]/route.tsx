import { readFile } from "fs/promises";
import { ImageResponse } from "next/og";
import { fileExists, getFileAbsolutePath } from "@/lib/storage";
import { isImageMimeType } from "@/lib/transfer-og";
import { getTransferBySlug } from "@/lib/transfers";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const transfer = await getTransferBySlug(slug);

  if (!transfer || !isImageMimeType(transfer.mimeType)) {
    return new Response("Vista previa no disponible.", { status: 404 });
  }

  const exists = await fileExists(transfer.storedName);
  if (!exists) {
    return new Response("Archivo no disponible.", { status: 410 });
  }

  const buffer = await readFile(getFileAbsolutePath(transfer.storedName));
  const base64 = buffer.toString("base64");
  const mimeType = transfer.mimeType.startsWith("image/")
    ? transfer.mimeType
    : "image/jpeg";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#020617",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:${mimeType};base64,${base64}`}
          alt={transfer.originalName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}

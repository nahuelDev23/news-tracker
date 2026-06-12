import { NextResponse } from "next/server";
import { createFileReadStream, fileExists } from "@/lib/storage";
import { getTransferBySlug } from "@/lib/transfers";
import { Readable } from "stream";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const transfer = await getTransferBySlug(slug);

  if (!transfer) {
    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  }

  const exists = await fileExists(transfer.storedName);
  if (!exists) {
    return NextResponse.json(
      { error: "El archivo ya no está disponible en el servidor." },
      { status: 410 },
    );
  }

  const stream = createFileReadStream(transfer.storedName);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": transfer.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(transfer.originalName)}"`,
      "Content-Length": String(transfer.sizeBytes),
      "Cache-Control": "private, no-store",
    },
  });
}

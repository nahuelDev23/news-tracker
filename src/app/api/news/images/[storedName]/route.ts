import { NextResponse } from "next/server";
import {
  createNewsImageReadStream,
  newsImageExists,
} from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { Readable } from "stream";

interface RouteContext {
  params: Promise<{ storedName: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { storedName } = await context.params;
  const decodedName = decodeURIComponent(storedName);

  const article = await prisma.fakeNewsArticle.findFirst({
    where: { imageStoredName: decodedName },
    select: { imageMimeType: true },
  });

  if (!article) {
    return NextResponse.json({ error: "Imagen no encontrada." }, { status: 404 });
  }

  const exists = await newsImageExists(decodedName);
  if (!exists) {
    return NextResponse.json(
      { error: "La imagen ya no está disponible." },
      { status: 410 },
    );
  }

  const stream = createNewsImageReadStream(decodedName);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": article.imageMimeType ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}

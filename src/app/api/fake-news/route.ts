import { NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { createFakeNewsArticle } from "@/lib/fake-news";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const changesPrompt = formData.get("changesPrompt");
    const originalText = formData.get("originalText");
    const image = formData.get("image");

    if (typeof changesPrompt !== "string" || !changesPrompt.trim()) {
      return NextResponse.json(
        { error: "Indicá qué detalles cambiar en la noticia." },
        { status: 400 },
      );
    }

    if (typeof originalText !== "string" || !originalText.trim()) {
      return NextResponse.json(
        { error: "Pegá el texto de la noticia original." },
        { status: 400 },
      );
    }

    const article = await createFakeNewsArticle({
      userId: session.userId,
      changesPrompt,
      originalText,
      image: image instanceof File && image.size > 0 ? image : null,
    });

    return NextResponse.json(article);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo generar la noticia.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

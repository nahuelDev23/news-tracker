import { NextResponse } from "next/server";
import { createRedirectLink } from "@/lib/redirects";
import { requireSession } from "@/lib/require-session";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { url?: string; targetNumber?: string };
    const url = body.url?.trim();
    const targetNumber = body.targetNumber?.trim();

    if (!url) {
      return NextResponse.json(
        { error: "La URL de la noticia es obligatoria." },
        { status: 400 },
      );
    }

    if (!targetNumber) {
      return NextResponse.json(
        { error: "El número objetivo es obligatorio." },
        { status: 400 },
      );
    }

    const link = await createRedirectLink(session.userId, url, targetNumber);

    return NextResponse.json({
      id: link.id,
      slug: link.slug,
      originalUrl: link.originalUrl,
      redirectUrl: link.redirectUrl,
      createdAt: link.createdAt.toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof TypeError
        ? "La URL ingresada no es válida."
        : "No se pudo crear el enlace.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { deleteFakeNewsArticle } from "@/lib/fake-news";
import { requireSession } from "@/lib/require-session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteFakeNewsArticle(id, session.userId);

  if (!deleted) {
    return NextResponse.json({ error: "Noticia no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

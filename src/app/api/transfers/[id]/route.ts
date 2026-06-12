import { NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { deleteTransfer } from "@/lib/transfers";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteTransfer(id, session.userId);

  if (!deleted) {
    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

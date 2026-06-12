import { NextResponse } from "next/server";
import { deleteRedirectLink } from "@/lib/redirects";
import { requireSession } from "@/lib/require-session";

interface DeleteRedirectRouteProps {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: DeleteRedirectRouteProps) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteRedirectLink(id, session.userId);

  if (!deleted) {
    return NextResponse.json({ error: "Enlace no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

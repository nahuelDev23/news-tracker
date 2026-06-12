import { NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { buildTransferSharePreview } from "@/lib/transfer-og";
import { createTransferFromFile } from "@/lib/transfers";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const label = formData.get("label");
    const targetNumberRaw = formData.get("targetNumber");
    const targetNumber =
      typeof targetNumberRaw === "string" ? targetNumberRaw.trim() : "";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Seleccioná un archivo válido." },
        { status: 400 },
      );
    }

    if (!targetNumber) {
      return NextResponse.json(
        { error: "El número objetivo es obligatorio." },
        { status: 400 },
      );
    }

    const transfer = await createTransferFromFile(file, {
      userId: session.userId,
      trackingEnabled: true,
      label: typeof label === "string" ? label.trim() || null : null,
      targetNumber,
    });

    const preview = buildTransferSharePreview(transfer);

    return NextResponse.json({
      id: transfer.id,
      slug: transfer.slug,
      downloadUrl: transfer.downloadUrl,
      originalName: transfer.originalName,
      sizeBytes: transfer.sizeBytes,
      preview,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo subir el archivo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

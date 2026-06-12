import { NextResponse } from "next/server";
import { buildTransferSharePreview } from "@/lib/transfer-og";
import { createTransferFromFile } from "@/lib/transfers";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Seleccioná un archivo válido." },
        { status: 400 },
      );
    }

    const transfer = await createTransferFromFile(file, {
      trackingEnabled: false,
      userId: null,
    });

    const preview = buildTransferSharePreview(transfer);

    return NextResponse.json({
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

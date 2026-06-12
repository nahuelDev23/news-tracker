import { NextResponse } from "next/server";
import {
  getTransferBySlug,
  processTransferHitInBackground,
  updateTransferHitClientMetadata,
} from "@/lib/transfers";
import {
  serializeRequestContext,
  type ClientMetadata,
} from "@/lib/request-info";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const transfer = await getTransferBySlug(slug);

  if (!transfer || !transfer.trackingEnabled) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    hitId?: string;
    client?: ClientMetadata;
  };

  const contextData = serializeRequestContext(request);

  if (body.hitId) {
    const updated = await updateTransferHitClientMetadata(
      body.hitId,
      transfer.id,
      body.client ?? {},
    );
    return NextResponse.json({ ok: updated });
  }

  const hitId = await processTransferHitInBackground(
    transfer.id,
    contextData,
    body.client,
  );

  return NextResponse.json({ hitId });
}

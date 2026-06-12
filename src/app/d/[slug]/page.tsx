import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import DownloadTracker from "@/components/DownloadTracker";
import TransferSharePage from "@/components/TransferSharePage";
import { serializeFromHeaders } from "@/lib/request-info";
import { isSocialCrawler } from "@/lib/social-crawler";
import { buildTransferShareMetadata } from "@/lib/transfer-og";
import { getTransferBySlug, registerTransferHit } from "@/lib/transfers";

interface DownloadPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DownloadPageProps): Promise<Metadata> {
  const { slug } = await params;
  const transfer = await getTransferBySlug(slug);

  if (!transfer) {
    return { title: "Archivo no encontrado" };
  }

  return buildTransferShareMetadata(transfer);
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { slug } = await params;
  const transfer = await getTransferBySlug(slug);

  if (!transfer) {
    notFound();
  }

  const headersList = await headers();
  const userAgent = headersList.get("user-agent");

  if (isSocialCrawler(userAgent)) {
    return <TransferSharePage transfer={transfer} />;
  }

  if (!transfer.trackingEnabled) {
    redirect(`/api/files/${slug}`);
  }

  const context = serializeFromHeaders(headersList);
  const hitId = await registerTransferHit(transfer.id, context);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <DownloadTracker
        slug={slug}
        hitId={hitId}
        fileName={transfer.originalName}
        sizeBytes={transfer.sizeBytes}
      />
    </main>
  );
}

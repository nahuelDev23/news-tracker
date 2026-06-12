import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TransferHitsTable from "@/components/TransferHitsTable";
import {
  getTransferForUser,
  listTransferHits,
} from "@/lib/transfers";
import { buildDownloadUrl } from "@/lib/redirect-url";
import { getSession } from "@/lib/session";

interface TransferDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TransferDetailPageProps): Promise<Metadata> {
  const session = await getSession();
  if (!session) return { title: "Transferencia" };

  const { id } = await params;
  const transfer = await getTransferForUser(id, session.userId);
  return {
    title: transfer?.originalName ?? "Transferencia",
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function TransferDetailPage({
  params,
}: TransferDetailPageProps) {
  const session = await getSession();
  if (!session) notFound();

  const { id } = await params;
  const transfer = await getTransferForUser(id, session.userId);

  if (!transfer) notFound();

  const hits = await listTransferHits(transfer.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/seetransfer"
          className="text-sm text-sky-400 transition hover:text-sky-300"
        >
          ← Volver a Seetransfer
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-white">{transfer.originalName}</h1>
        <p className="mt-2 text-slate-400">
          {formatBytes(transfer.sizeBytes)} · {transfer._count.hits} descarga
          {transfer._count.hits === 1 ? "" : "s"}
        </p>
        <a
          href={buildDownloadUrl(transfer.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block break-all font-mono text-sm text-sky-400 hover:text-sky-300"
        >
          {buildDownloadUrl(transfer.slug)}
        </a>
      </div>

      <TransferHitsTable hits={hits} />
    </div>
  );
}

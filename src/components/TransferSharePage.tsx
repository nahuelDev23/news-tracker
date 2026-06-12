import {
  getTransferOgTitle,
  getTransferPreviewImageUrl,
} from "@/lib/transfer-og";

interface TransferSharePageProps {
  transfer: {
    slug: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    label: string | null;
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TransferSharePage({ transfer }: TransferSharePageProps) {
  const title = getTransferOgTitle(transfer);
  const imageUrl = getTransferPreviewImageUrl(transfer);
  const downloadUrl = `/api/files/${transfer.slug}`;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <article className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="aspect-[1200/630] w-full object-cover"
        />
        <div className="space-y-4 p-8">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-slate-500">
            {formatBytes(transfer.sizeBytes)}
            {transfer.mimeType ? ` · ${transfer.mimeType}` : ""}
          </p>
          <a
            href={downloadUrl}
            className="inline-flex rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Descargar archivo
          </a>
        </div>
      </article>
    </main>
  );
}

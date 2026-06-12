"use client";

import { useEffect, useState } from "react";

interface DownloadTrackerProps {
  slug: string;
  hitId: string;
  fileName: string;
  sizeBytes: number;
}

function collectClientMetadata() {
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string };
    }
  ).connection;

  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezoneClient: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connectionType: connection?.effectiveType ?? null,
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DownloadTracker({
  slug,
  hitId,
  fileName,
  sizeBytes,
}: DownloadTrackerProps) {
  const [status, setStatus] = useState<"tracking" | "ready" | "error">("tracking");
  const downloadUrl = `/api/files/${slug}`;

  useEffect(() => {
    let cancelled = false;

    async function sendClientMetadataAndDownload() {
      try {
        await fetch(`/api/files/${slug}/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hitId,
            client: collectClientMetadata(),
          }),
        });
      } catch {
        // La descarga sigue aunque falle el metadata del cliente.
      }

      if (!cancelled) {
        setStatus("ready");
        window.location.href = downloadUrl;
      }
    }

    sendClientMetadataAndDownload();

    return () => {
      cancelled = true;
    };
  }, [slug, hitId, downloadUrl]);

  return (
    <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-sky-400">
        Seetransfer
      </p>
      <h1 className="mt-4 text-2xl font-bold text-white">{fileName}</h1>
      <p className="mt-2 text-slate-400">{formatBytes(sizeBytes)}</p>

      {status === "tracking" && (
        <p className="mt-8 text-slate-300">Preparando tu descarga...</p>
      )}

      {status === "ready" && (
        <a
          href={downloadUrl}
          className="mt-8 inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          Descargar de nuevo
        </a>
      )}

      {status === "error" && (
        <div className="mt-8 space-y-4">
          <p className="text-red-300">No se pudo iniciar la descarga automática.</p>
          <a
            href={downloadUrl}
            className="inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Descargar manualmente
          </a>
        </div>
      )}
    </div>
  );
}

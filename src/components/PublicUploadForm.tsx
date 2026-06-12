"use client";

import { FormEvent, useRef, useState } from "react";
import TransferSharePreview from "@/components/TransferSharePreview";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PublicUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    downloadUrl: string;
    originalName: string;
    sizeBytes: number;
    preview: {
      title: string;
      description: string;
      imageUrl: string;
      downloadUrl: string;
    };
  } | null>(null);

  async function uploadFile(file: File) {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/public", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        downloadUrl?: string;
        originalName?: string;
        sizeBytes?: number;
        preview?: {
          title: string;
          description: string;
          imageUrl: string;
          downloadUrl: string;
        };
      };

      if (!response.ok) {
        setError(data.error ?? "No se pudo subir el archivo.");
        return;
      }

      if (data.downloadUrl && data.originalName && data.sizeBytes != null && data.preview) {
        setResult({
          downloadUrl: data.downloadUrl,
          originalName: data.originalName,
          sizeBytes: data.sizeBytes,
          preview: data.preview,
        });
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(fileList: FileList | null) {
    const file = fileList?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handleDrop(event.dataTransfer.files);
          }}
          className={`rounded-3xl border-2 border-dashed p-10 text-center transition ${
            dragging
              ? "border-sky-400 bg-sky-500/10"
              : "border-slate-700 bg-slate-900/50 hover:border-slate-500"
          }`}
        >
          <p className="text-lg font-medium text-white">
            Arrastrá tu archivo aquí
          </p>
          <p className="mt-2 text-sm text-slate-400">
            o seleccioná uno desde tu dispositivo
          </p>
          <label className="mt-6 inline-flex cursor-pointer rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400">
            Elegir archivo
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadFile(file);
              }}
            />
          </label>
        </div>

        {loading && (
          <p className="text-center text-slate-300">Subiendo archivo...</p>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <p className="font-medium text-emerald-200">¡Listo! Compartí este enlace:</p>
              <p className="mt-2 break-all font-mono text-sm text-emerald-100">
                {result.downloadUrl}
              </p>
              <p className="mt-3 text-sm text-emerald-300/80">
                {result.originalName} · {formatBytes(result.sizeBytes)}
              </p>
            </div>
            <TransferSharePreview {...result.preview} />
          </div>
        )}
      </form>
    </div>
  );
}

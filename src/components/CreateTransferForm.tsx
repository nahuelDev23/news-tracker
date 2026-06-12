"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TransferSharePreview from "@/components/TransferSharePreview";

export default function CreateTransferForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("");
  const [targetNumber, setTargetNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCreated, setLastCreated] = useState<{
    downloadUrl: string;
    preview: {
      title: string;
      description: string;
      imageUrl: string;
      downloadUrl: string;
    };
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setError("Seleccioná un archivo.");
      return;
    }

    if (!targetNumber.trim()) {
      setError("El número objetivo es obligatorio.");
      return;
    }

    setError("");
    setLoading(true);
    setLastCreated(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetNumber", targetNumber.trim());
      if (label.trim()) formData.append("label", label.trim());

      const response = await fetch("/api/transfers", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        downloadUrl?: string;
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

      setLabel("");
      setTargetNumber("");
      if (inputRef.current) inputRef.current.value = "";
      if (data.downloadUrl && data.preview) {
        setLastCreated({
          downloadUrl: data.downloadUrl,
          preview: data.preview,
        });
      }
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-white">Subir archivo con tracking</h2>
      <p className="mt-2 text-sm text-slate-400">
        Cada descarga del enlace generado registrará los datos del dispositivo.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="transfer-target-number"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Número objetivo
          </label>
          <input
            id="transfer-target-number"
            type="text"
            required
            value={targetNumber}
            onChange={(event) => setTargetNumber(event.target.value)}
            placeholder="Ej: 593991234567 o campaña-42"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="transfer-label"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Etiqueta (opcional)
          </label>
          <input
            id="transfer-label"
            type="text"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Campaña marzo"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="transfer-file"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Archivo
          </label>
          <input
            id="transfer-file"
            ref={inputRef}
            type="file"
            required
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-sky-400"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {lastCreated && (
          <div className="space-y-4">
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              Enlace creado:{" "}
              <span className="break-all font-mono text-emerald-200">
                {lastCreated.downloadUrl}
              </span>
            </p>
            <TransferSharePreview {...lastCreated.preview} compact />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !targetNumber.trim()}
          className="rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Subiendo..." : "Generar enlace de descarga"}
        </button>
      </form>
    </div>
  );
}

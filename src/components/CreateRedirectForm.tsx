"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRedirectForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [targetNumber, setTargetNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCreated, setLastCreated] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    setLastCreated(null);

    try {
      const response = await fetch("/api/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, targetNumber: targetNumber.trim() }),
      });

      const data = (await response.json()) as {
        error?: string;
        redirectUrl?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "No se pudo crear el enlace.");
        return;
      }

      setUrl("");
      setTargetNumber("");
      setLastCreated(data.redirectUrl ?? null);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-white">Crear enlace puente</h2>
      <p className="mt-2 text-sm text-slate-400">
        Pega la URL original de la noticia y genera un enlace en tu dominio que
        registra cada dispositivo que pasa por el redirect.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="target-number"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Número objetivo
          </label>
          <input
            id="target-number"
            type="text"
            required
            value={targetNumber}
            onChange={(event) => setTargetNumber(event.target.value)}
            placeholder="Ej: 593991234567 o campaña-42"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="news-url"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            URL de la noticia
          </label>
          <input
            id="news-url"
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="www.clarin.com/mi-noticia"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {lastCreated && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            Enlace creado:{" "}
            <span className="break-all font-mono text-emerald-200">{lastCreated}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !targetNumber.trim()}
          className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generando..." : "Generar enlace redirect"}
        </button>
      </form>
    </div>
  );
}

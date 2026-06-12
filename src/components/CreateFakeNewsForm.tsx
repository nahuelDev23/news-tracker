"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateFakeNewsForm() {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const [changesPrompt, setChangesPrompt] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCreated, setLastCreated] = useState<{
    newsUrl: string;
    title: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!changesPrompt.trim()) {
      setError("Indicá qué detalles cambiar en la noticia.");
      return;
    }

    if (!originalText.trim()) {
      setError("Pegá el texto de la noticia original.");
      return;
    }

    setError("");
    setLoading(true);
    setLastCreated(null);

    try {
      const formData = new FormData();
      formData.append("changesPrompt", changesPrompt.trim());
      formData.append("originalText", originalText.trim());

      const image = imageRef.current?.files?.[0];
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("/api/fake-news", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        newsUrl?: string;
        title?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "No se pudo generar la noticia.");
        return;
      }

      if (data.newsUrl && data.title) {
        setLastCreated({ newsUrl: data.newsUrl, title: data.title });
      }

      setChangesPrompt("");
      setOriginalText("");
      if (imageRef.current) imageRef.current.value = "";
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-white">Generar noticia modificada</h2>
        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-500/20 text-amber-400">
          beta
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        La IA mantiene la noticia casi idéntica al original e integra los cambios
        de forma orgánica y sutil, solo donde haga falta.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="fake-news-changes"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Detalles a cambiar
          </label>
          <input
            id="fake-news-changes"
            type="text"
            required
            value={changesPrompt}
            onChange={(event) => setChangesPrompt(event.target.value)}
            placeholder="Ej: el hombre se llama Sergio y lo atropelló una moto, no un auto"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="fake-news-original"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Noticia original
          </label>
          <textarea
            id="fake-news-original"
            required
            rows={12}
            value={originalText}
            onChange={(event) => setOriginalText(event.target.value)}
            placeholder="Pegá aquí el texto completo de la noticia real..."
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm leading-relaxed text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="fake-news-image"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Imagen (opcional)
          </label>
          <input
            id="fake-news-image"
            ref={imageRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-amber-400"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {lastCreated && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            Noticia creada:{" "}
            <a
              href={lastCreated.newsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-mono text-emerald-200 underline hover:text-emerald-100"
            >
              {lastCreated.newsUrl}
            </a>
            <span className="mt-1 block text-emerald-400/90">{lastCreated.title}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generando con IA..." : "Generar noticia"}
        </button>
      </form>
    </div>
  );
}

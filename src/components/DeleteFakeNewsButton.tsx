"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteFakeNewsButtonProps {
  id: string;
  title: string;
}

export default function DeleteFakeNewsButton({
  id,
  title,
}: DeleteFakeNewsButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar esta noticia?\n\n${title}`,
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/fake-news/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "No se pudo eliminar la noticia.");
        return;
      }

      router.refresh();
    } catch {
      window.alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="font-medium text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}

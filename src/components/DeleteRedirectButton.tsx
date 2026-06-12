"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteRedirectButtonProps {
  id: string;
  redirectUrl: string;
}

export default function DeleteRedirectButton({
  id,
  redirectUrl,
}: DeleteRedirectButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar este enlace?\n\n${redirectUrl}\n\nSe borrarán también todos los registros de dispositivos asociados.`,
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/redirects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "No se pudo eliminar el enlace.");
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

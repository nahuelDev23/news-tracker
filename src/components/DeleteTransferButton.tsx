"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteTransferButtonProps {
  id: string;
  fileName: string;
}

export default function DeleteTransferButton({
  id,
  fileName,
}: DeleteTransferButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar "${fileName}" y todos sus registros de descarga?`,
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/transfers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        window.alert("No se pudo eliminar el archivo.");
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
      className="text-left text-sm text-red-400 transition hover:text-red-300 disabled:opacity-60"
    >
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}

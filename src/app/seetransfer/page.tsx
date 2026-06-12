import type { Metadata } from "next";
import PublicUploadForm from "@/components/PublicUploadForm";

export const metadata: Metadata = {
  title: "Seetransfer — Envía archivos fácilmente",
  description:
    "Sube archivos y comparte un enlace de descarga. Rápido, simple y sin complicaciones.",
};

export default function SeetransferPublicPage() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-16">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 text-2xl font-bold text-slate-950">
          S
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Seetransfer</h1>
        <p className="mt-3 max-w-lg text-slate-400">
          Subí un archivo, obtené un enlace y compartilo. Rápido, simple y sin complicaciones.
        </p>
      </div>

      <PublicUploadForm />

      <p className="mt-12 text-center text-xs text-slate-600">
        Los archivos se almacenan de forma temporal en nuestros servidores.
      </p>
    </main>
  );
}

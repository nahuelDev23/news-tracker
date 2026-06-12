import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RedirectHitsTable from "@/components/RedirectHitsTable";
import { buildRedirectUrl } from "@/lib/redirect-url";
import {
  getRedirectLinkForUser,
  listRedirectHits,
} from "@/lib/redirects";
import { getSession } from "@/lib/session";

interface RedirectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: RedirectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await getSession();
  if (!session) return { title: "Redirect" };

  const link = await getRedirectLinkForUser(id, session.userId);
  if (!link) return { title: "Redirect" };

  return {
    title: `Dispositivos · ${link.slug}`,
  };
}

export default async function RedirectDetailPage({
  params,
}: RedirectDetailPageProps) {
  const session = await getSession();
  if (!session) notFound();

  const { id } = await params;
  const link = await getRedirectLinkForUser(id, session.userId);

  if (!link) {
    notFound();
  }

  const hits = await listRedirectHits(link.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-amber-400 hover:text-amber-300"
        >
          ← Volver al dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-white">Dispositivos redirigidos</h1>
        <p className="mt-2 text-slate-400">
          Cada fila representa un dispositivo que pasó por el enlace puente.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Enlace generado
          </p>
          <a
            href={buildRedirectUrl(link.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 break-all font-mono text-amber-400 hover:text-amber-300"
          >
            {buildRedirectUrl(link.slug)}
          </a>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            URL original
          </p>
          <a
            href={link.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 break-all text-slate-300 hover:text-white"
          >
            {link.originalUrl}
          </a>
        </div>
      </div>

      <RedirectHitsTable hits={hits} />
    </div>
  );
}

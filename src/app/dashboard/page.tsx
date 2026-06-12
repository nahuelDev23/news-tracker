import type { Metadata } from "next";
import CreateRedirectForm from "@/components/CreateRedirectForm";
import RedirectLinksTable from "@/components/RedirectLinksTable";
import { listRedirectLinks } from "@/lib/redirects";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard — Redirects",
  description: "Panel de administración de Notipip",
};

export default async function DashboardPage() {
  const session = await getSession();
  const links = session ? await listRedirectLinks(session.userId) : [];

  return (
    <div className="space-y-8">
      <CreateRedirectForm />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Enlaces generados</h2>
          <p className="mt-1 text-sm text-slate-400">
            Cada fila es un puente entre tu dominio y la noticia original.
          </p>
        </div>
        <RedirectLinksTable links={links} />
      </section>
    </div>
  );
}

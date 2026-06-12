import type { Metadata } from "next";
import CreateTransferForm from "@/components/CreateTransferForm";
import TransfersTable from "@/components/TransfersTable";
import { listTransfers } from "@/lib/transfers";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard — Seetransfer",
};

export default async function SeetransferDashboardPage() {
  const session = await getSession();
  const transfers = session ? await listTransfers(session.userId) : [];

  return (
    <div className="space-y-8">
      <CreateTransferForm />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Archivos con tracking</h2>
          <p className="mt-1 text-sm text-slate-400">
            Solo los enlaces creados desde aquí registran datos de descarga.
          </p>
        </div>
        <TransfersTable transfers={transfers} />
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DeleteTransferButton from "@/components/DeleteTransferButton";
import TargetNumberSearch from "@/components/TargetNumberSearch";
import { formatTableDate } from "@/lib/format-date";
import { matchesTargetNumber } from "@/lib/filter-by-target-number";
import type { TransferSummary } from "@/types/transfer";

interface TransfersTableProps {
  transfers: TransferSummary[];
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TransfersTable({ transfers }: TransfersTableProps) {
  const [query, setQuery] = useState("");

  const filteredTransfers = useMemo(
    () =>
      transfers.filter((transfer) =>
        matchesTargetNumber(transfer.targetNumber, query),
      ),
    [transfers, query],
  );

  if (transfers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">
        Todavía no hay archivos subidos desde el dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <TargetNumberSearch
        value={query}
        onChange={setQuery}
        resultCount={filteredTransfers.length}
        totalCount={transfers.length}
      />

      {filteredTransfers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">
          Ningún archivo coincide con &ldquo;{query.trim()}&rdquo;.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Nº objetivo
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Archivo
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Enlace
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Descargas
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Creado
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {filteredTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-mono text-slate-200">
                      {transfer.targetNumber || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">
                        {transfer.originalName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatBytes(transfer.sizeBytes)}
                        {transfer.label ? ` · ${transfer.label}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={transfer.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-mono text-sky-400 hover:text-sky-300"
                      >
                        {transfer.downloadUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{transfer.hitCount}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatTableDate(transfer.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/dashboard/seetransfer/${transfer.id}`}
                          className="font-medium text-sky-400 hover:text-sky-300"
                        >
                          Ver dispositivos
                        </Link>
                        <DeleteTransferButton
                          id={transfer.id}
                          fileName={transfer.originalName}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DeleteRedirectButton from "@/components/DeleteRedirectButton";
import TargetNumberSearch from "@/components/TargetNumberSearch";
import { formatTableDate } from "@/lib/format-date";
import { matchesTargetNumber } from "@/lib/filter-by-target-number";
import type { RedirectLinkSummary } from "@/types/redirect";

interface RedirectLinksTableProps {
  links: RedirectLinkSummary[];
}

export default function RedirectLinksTable({ links }: RedirectLinksTableProps) {
  const [query, setQuery] = useState("");

  const filteredLinks = useMemo(
    () => links.filter((link) => matchesTargetNumber(link.targetNumber, query)),
    [links, query],
  );

  if (links.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">
        Todavía no hay enlaces creados. Genera el primero con el formulario de arriba.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <TargetNumberSearch
        value={query}
        onChange={setQuery}
        resultCount={filteredLinks.length}
        totalCount={links.length}
      />

      {filteredLinks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">
          Ningún enlace coincide con &ldquo;{query.trim()}&rdquo;.
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
                    Enlace generado
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    URL original
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Clicks
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
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-mono text-slate-200">
                      {link.targetNumber || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={link.redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-mono text-amber-400 hover:text-amber-300"
                      >
                        {link.redirectUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-slate-300 hover:text-white"
                      >
                        {link.originalUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{link.hitCount}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatTableDate(link.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/dashboard/redirects/${link.id}`}
                          className="font-medium text-amber-400 hover:text-amber-300"
                        >
                          Ver dispositivos
                        </Link>
                        <DeleteRedirectButton
                          id={link.id}
                          redirectUrl={link.redirectUrl}
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

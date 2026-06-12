import type { RedirectHitRecord } from "@/types/redirect";
import { formatHitDate } from "@/lib/format-date";

interface RedirectHitsTableProps {
  hits: RedirectHitRecord[];
}

function formatCoords(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return "—";
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export default function RedirectHitsTable({ hits }: RedirectHitsTableProps) {
  if (hits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">
        Nadie ha pasado por este enlace todavía.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Fecha</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                IP pública
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                IP local
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                Lat / Lng
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Geo</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                Dispositivo
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                Navegador
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                Pantalla
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                Idioma
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">
                Referer
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {hits.map((hit) => (
              <tr key={hit.id} className="align-top hover:bg-slate-900/50">
                <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                  {formatHitDate(hit.createdAt)}
                </td>
                <td className="px-4 py-3 font-mono text-slate-200">
                  {hit.ipAddress ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-slate-400">
                  {hit.internalIp ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-slate-200">
                  {formatCoords(hit.latitude, hit.longitude)}
                  {hit.geoSource && (
                    <span className="mt-1 block text-xs text-slate-500">
                      via {hit.geoSource}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  <div>{hit.city ?? "—"}</div>
                  <div className="text-xs text-slate-500">
                    {[hit.region, hit.country].filter(Boolean).join(", ") || "—"}
                  </div>
                  <div className="text-xs text-slate-500">{hit.isp ?? "—"}</div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  <div>{hit.deviceType ?? "—"}</div>
                  <div className="text-xs text-slate-500">{hit.platform ?? "—"}</div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  <div>{hit.browser ?? "—"}</div>
                  <div className="max-w-xs truncate text-xs text-slate-500">
                    {hit.userAgent ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {hit.screenWidth && hit.screenHeight
                    ? `${hit.screenWidth}x${hit.screenHeight}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {hit.language ?? hit.acceptLanguage ?? "—"}
                </td>
                <td className="px-4 py-3 max-w-xs break-all text-slate-400">
                  {hit.referer ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

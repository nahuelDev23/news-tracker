import type { TransferHitRecord } from "@/types/transfer";
import { formatHitDate } from "@/lib/format-date";

interface TransferHitsTableProps {
  hits: TransferHitRecord[];
}

function formatCoords(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return "—";
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

const thClass = "px-2 py-3 text-left text-xs font-medium text-slate-300 sm:px-3";
const tdClass = "px-2 py-3 align-top text-sm sm:px-3";

export default function TransferHitsTable({ hits }: TransferHitsTableProps) {
  if (hits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">
        Nadie ha descargado este archivo todavía.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <table className="w-full table-fixed divide-y divide-slate-800 text-sm">
        <colgroup>
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[12%]" />
          <col className="w-[9%]" />
          <col className="w-[14%]" />
          <col className="w-[7%]" />
          <col className="w-[8%]" />
          <col className="w-[8%]" />
        </colgroup>
        <thead className="bg-slate-900/80">
          <tr>
            <th className={thClass}>Fecha</th>
            <th className={thClass}>IP pública</th>
            <th className={thClass}>IP local</th>
            <th className={thClass}>Lat / Lng</th>
            <th className={thClass}>Geo</th>
            <th className={thClass}>Dispositivo</th>
            <th className={thClass}>Navegador</th>
            <th className={thClass}>Pantalla</th>
            <th className={thClass}>Idioma</th>
            <th className={thClass}>Referer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/40">
          {hits.map((hit) => (
            <tr key={hit.id} className="hover:bg-slate-900/50">
              <td className={`${tdClass} whitespace-nowrap text-slate-400`}>
                {formatHitDate(hit.createdAt)}
              </td>
              <td className={`${tdClass} truncate font-mono text-slate-200`} title={hit.ipAddress ?? undefined}>
                {hit.ipAddress ?? "—"}
              </td>
              <td className={`${tdClass} truncate font-mono text-slate-400`} title={hit.internalIp ?? undefined}>
                {hit.internalIp ?? "—"}
              </td>
              <td className={`${tdClass} font-mono text-xs text-slate-200`}>
                {formatCoords(hit.latitude, hit.longitude)}
              </td>
              <td className={`${tdClass} text-slate-300`}>
                <div className="truncate">{hit.city ?? "—"}</div>
                <div className="truncate text-xs text-slate-500">
                  {[hit.region, hit.country].filter(Boolean).join(", ") || "—"}
                </div>
              </td>
              <td className={`${tdClass} text-slate-300`}>
                <div className="truncate">{hit.deviceType ?? "—"}</div>
                <div className="truncate text-xs text-slate-500">{hit.platform ?? "—"}</div>
              </td>
              <td className={`${tdClass} text-slate-300`}>
                <div className="truncate">{hit.browser ?? "—"}</div>
                {hit.userAgent && (
                  <div
                    className="truncate text-xs text-slate-500"
                    title={hit.userAgent}
                  >
                    {hit.userAgent}
                  </div>
                )}
              </td>
              <td className={`${tdClass} whitespace-nowrap text-slate-300`}>
                {hit.screenWidth && hit.screenHeight
                  ? `${hit.screenWidth}x${hit.screenHeight}`
                  : "—"}
              </td>
              <td className={`${tdClass} truncate text-slate-300`} title={hit.language ?? hit.acceptLanguage ?? undefined}>
                {hit.language ?? hit.acceptLanguage ?? "—"}
              </td>
              <td className={`${tdClass} truncate text-slate-400`} title={hit.referer ?? undefined}>
                {hit.referer ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

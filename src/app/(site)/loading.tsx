export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
        >
          <div className="aspect-[16/10] bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-24 rounded bg-slate-800" />
            <div className="h-4 w-full rounded bg-slate-800" />
            <div className="h-4 w-4/5 rounded bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface TargetNumberSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function TargetNumberSearch({
  value,
  onChange,
  resultCount,
  totalCount,
}: TargetNumberSearchProps) {
  const isFiltering = value.trim().length > 0;

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <label className="sr-only" htmlFor="target-number-search">
        Buscar por número objetivo
      </label>
      <input
        id="target-number-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por número objetivo..."
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 sm:py-3"
      />
      {isFiltering && (
        <p className="text-sm text-slate-400">
          {resultCount} de {totalCount} resultado{totalCount === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}

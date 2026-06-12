interface TransferSharePreviewProps {
  title: string;
  imageUrl: string;
  compact?: boolean;
}

export default function TransferSharePreview({
  title,
  imageUrl,
  compact = false,
}: TransferSharePreviewProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 ${
        compact ? "max-w-xs" : ""
      }`}
    >
      <p
        className={`border-b border-slate-800 font-medium uppercase tracking-widest text-slate-500 ${
          compact ? "px-3 py-1.5 text-[10px]" : "px-4 py-2 text-xs"
        }`}
      >
        Vista previa al compartir
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        className="aspect-[1200/630] w-full object-cover"
      />
    </div>
  );
}

import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

interface DashboardHeaderProps {
  username: string;
  description: string;
}

export default function DashboardHeader({
  username,
  description,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-amber-500">
          Panel
        </p>
        <h1 className="mt-1 text-3xl font-bold text-white">
          Bienvenido, {username}
        </h1>
        <p className="mt-2 text-slate-400">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          Ver noticias
        </Link>
        <Link
          href="/seetransfer"
          target="_blank"
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          Front Seetransfer
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}

import Link from "next/link";
import { categories } from "@/lib/categories";

interface NavbarProps {
  pathname: string;
}

export default function Navbar({ pathname }: NavbarProps) {
  const activeSlug = pathname === "/" ? "portada" : pathname.slice(1);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-lg font-black text-slate-950 transition-transform group-hover:scale-105">
              N
            </span>
            <div className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-white">
                Notipip
              </span>
              <span className="hidden text-[10px] uppercase tracking-widest text-slate-400 sm:block">
                Google News
              </span>
            </div>
          </Link>

          <nav
            aria-label="Filtrar por tema"
            className="flex flex-1 items-center justify-end gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((category) => {
              const href = category.slug === "portada" ? "/" : `/${category.slug}`;
              const isActive = activeSlug === category.slug;

              return (
                <Link
                  key={category.slug}
                  href={href}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-amber-500 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {category.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

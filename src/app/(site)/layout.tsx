import Navbar from "@/components/Navbar";
import { getRequestPathname } from "@/lib/request-pathname";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = await getRequestPathname();

  return (
    <>
      <Navbar pathname={pathname} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        <p>
          Notipip · Noticias de Ecuador vía{" "}
          <a
            href="https://news.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500 hover:underline"
          >
            Google News RSS
          </a>
        </p>
      </footer>
    </>
  );
}

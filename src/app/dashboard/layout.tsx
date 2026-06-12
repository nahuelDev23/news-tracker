import DashboardTabs from "@/components/DashboardTabs";
import DashboardHeader from "@/components/DashboardHeader";
import { getRequestPathname } from "@/lib/request-pathname";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const pathname = await getRequestPathname();
  const isWideTableView =
    /^\/dashboard\/redirects\/[^/]+$/.test(pathname) ||
    /^\/dashboard\/seetransfer\/[^/]+$/.test(pathname);

  return (
    <main
      className={`mx-auto w-full flex-1 py-8 ${
        isWideTableView
          ? "max-w-[min(100vw-1.5rem,1920px)] px-3 sm:px-4"
          : "max-w-7xl px-4 sm:px-6 lg:px-8"
      }`}
    >
      {session && (
        <div className="space-y-6">
          <DashboardHeader
            username={session.username}
            description="Gestiona redirects, transferencias de archivos y noticias con IA."
          />
          <DashboardTabs initialPathname={pathname} />
        </div>
      )}
      <div className="mt-8">{children}</div>
    </main>
  );
}

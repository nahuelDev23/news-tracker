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

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      {session && (
        <div className="space-y-6">
          <DashboardHeader
            username={session.username}
            description="Gestiona redirects de noticias y transferencias de archivos."
          />
          <DashboardTabs initialPathname={pathname} />
        </div>
      )}
      <div className="mt-8">{children}</div>
    </main>
  );
}

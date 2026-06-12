import type { Metadata } from "next";
import CreateFakeNewsForm from "@/components/CreateFakeNewsForm";
import FakeNewsArticlesTable from "@/components/FakeNewsArticlesTable";
import { listFakeNewsArticles } from "@/lib/fake-news";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard — Fake News",
  description: "Generador de noticias modificadas con IA",
};

export default async function FakeNewsDashboardPage() {
  const session = await getSession();
  const articles = session ? await listFakeNewsArticles(session.userId) : [];

  return (
    <div className="space-y-8">
      <CreateFakeNewsForm />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Noticias generadas</h2>
          <p className="mt-1 text-sm text-slate-400">
            Cada fila es una noticia publicada en{" "}
            <span className="font-mono text-slate-300">/news/[id]</span>.
          </p>
        </div>
        <FakeNewsArticlesTable articles={articles} />
      </section>
    </div>
  );
}

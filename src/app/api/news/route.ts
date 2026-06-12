import { NextResponse } from "next/server";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { fetchGoogleNews } from "@/lib/google-news";

export const revalidate = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("category") ?? "portada";
  const category = getCategoryBySlug(slug);

  if (!category) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  try {
    const articles = await fetchGoogleNews(category.feedUrl);
    return NextResponse.json({ category: category.slug, articles });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar las noticias" },
      { status: 502 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ categories: categories.map((c) => c.slug) });
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsPageContent from "@/components/NewsPageContent";
import { categories, getCategoryBySlug } from "@/lib/categories";

export const revalidate = 300;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return categories
    .filter((c) => c.slug !== "portada")
    .map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Notipip" };

  return {
    title: category.label,
    description: `Últimas noticias de ${category.label.toLowerCase()} en Notipip, agregadas desde Google News.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category || category.slug === "portada") {
    notFound();
  }

  return <NewsPageContent category={category} />;
}

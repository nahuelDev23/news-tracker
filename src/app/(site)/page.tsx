import NewsPageContent from "@/components/NewsPageContent";
import { defaultCategory } from "@/lib/categories";

export const revalidate = 300;

export default function Home() {
  return <NewsPageContent category={defaultCategory} />;
}

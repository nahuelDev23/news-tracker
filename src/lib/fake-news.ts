import { generateFakeNewsWithAI } from "@/lib/openrouter";
import { buildNewsImageUrl, buildNewsUrl } from "@/lib/news-url";
import { prisma } from "@/lib/prisma";
import { deleteNewsImage, saveNewsImage } from "@/lib/storage";
import type { FakeNewsArticleSummary } from "@/types/fake-news";

interface CreateFakeNewsInput {
  userId: string;
  changesPrompt: string;
  originalText: string;
  image?: File | null;
}

function toSummary(article: {
  id: string;
  title: string;
  summary: string | null;
  changesPrompt: string;
  imageStoredName: string | null;
  createdAt: Date;
}): FakeNewsArticleSummary {
  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    changesPrompt: article.changesPrompt,
    newsUrl: buildNewsUrl(article.id),
    imageUrl: article.imageStoredName
      ? buildNewsImageUrl(article.imageStoredName)
      : null,
    createdAt: article.createdAt.toISOString(),
  };
}

export async function createFakeNewsArticle(input: CreateFakeNewsInput) {
  const changesPrompt = input.changesPrompt.trim();
  const originalText = input.originalText.trim();

  if (!changesPrompt) {
    throw new Error("Indicá qué detalles cambiar en la noticia.");
  }

  if (!originalText) {
    throw new Error("Pegá el texto de la noticia original.");
  }

  const generated = await generateFakeNewsWithAI({
    changesPrompt,
    originalText,
  });

  let imageStoredName: string | null = null;
  let imageMimeType: string | null = null;

  if (input.image && input.image.size > 0) {
    const saved = await saveNewsImage(input.image);
    imageStoredName = saved.storedName;
    imageMimeType = saved.mimeType;
  }

  const article = await prisma.fakeNewsArticle.create({
    data: {
      title: generated.title,
      body: generated.body,
      summary: generated.summary || null,
      changesPrompt,
      originalText,
      imageStoredName,
      imageMimeType,
      userId: input.userId,
    },
  });

  return toSummary(article);
}

export async function listFakeNewsArticles(
  userId: string,
): Promise<FakeNewsArticleSummary[]> {
  const articles = await prisma.fakeNewsArticle.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      summary: true,
      changesPrompt: true,
      imageStoredName: true,
      createdAt: true,
    },
  });

  return articles.map(toSummary);
}

export async function getFakeNewsArticleById(id: string) {
  return prisma.fakeNewsArticle.findUnique({
    where: { id },
  });
}

export async function deleteFakeNewsArticle(id: string, userId: string) {
  const article = await prisma.fakeNewsArticle.findFirst({
    where: { id, userId },
    select: { id: true, imageStoredName: true },
  });

  if (!article) return false;

  if (article.imageStoredName) {
    await deleteNewsImage(article.imageStoredName);
  }

  await prisma.fakeNewsArticle.delete({
    where: { id: article.id },
  });

  return true;
}

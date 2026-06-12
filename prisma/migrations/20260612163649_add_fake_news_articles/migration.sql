-- CreateTable
CREATE TABLE "fake_news_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "summary" TEXT,
    "changes_prompt" TEXT NOT NULL,
    "original_text" TEXT NOT NULL,
    "image_stored_name" TEXT,
    "image_mime_type" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fake_news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fake_news_articles_user_id_idx" ON "fake_news_articles"("user_id");

-- AddForeignKey
ALTER TABLE "fake_news_articles" ADD CONSTRAINT "fake_news_articles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

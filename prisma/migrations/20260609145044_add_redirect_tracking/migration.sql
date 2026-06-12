-- CreateTable
CREATE TABLE "redirect_links" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "label" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redirect_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redirect_hits" (
    "id" TEXT NOT NULL,
    "redirect_link_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geo_source" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "timezone" TEXT,
    "isp" TEXT,
    "user_agent" TEXT,
    "accept_language" TEXT,
    "accept_encoding" TEXT,
    "referer" TEXT,
    "platform" TEXT,
    "browser" TEXT,
    "device_type" TEXT,
    "screen_width" INTEGER,
    "screen_height" INTEGER,
    "language" TEXT,
    "timezone_client" TEXT,
    "connection_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redirect_hits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "redirect_links_slug_key" ON "redirect_links"("slug");

-- CreateIndex
CREATE INDEX "redirect_hits_redirect_link_id_idx" ON "redirect_hits"("redirect_link_id");

-- CreateIndex
CREATE INDEX "redirect_hits_created_at_idx" ON "redirect_hits"("created_at");

-- AddForeignKey
ALTER TABLE "redirect_links" ADD CONSTRAINT "redirect_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redirect_hits" ADD CONSTRAINT "redirect_hits_redirect_link_id_fkey" FOREIGN KEY ("redirect_link_id") REFERENCES "redirect_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

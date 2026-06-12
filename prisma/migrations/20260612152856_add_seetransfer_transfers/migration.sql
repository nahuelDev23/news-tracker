-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "stored_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "tracking_enabled" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_hits" (
    "id" TEXT NOT NULL,
    "transfer_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "internal_ip" TEXT,
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

    CONSTRAINT "transfer_hits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transfers_slug_key" ON "transfers"("slug");

-- CreateIndex
CREATE INDEX "transfers_user_id_idx" ON "transfers"("user_id");

-- CreateIndex
CREATE INDEX "transfer_hits_transfer_id_idx" ON "transfer_hits"("transfer_id");

-- CreateIndex
CREATE INDEX "transfer_hits_created_at_idx" ON "transfer_hits"("created_at");

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_hits" ADD CONSTRAINT "transfer_hits_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

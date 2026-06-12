-- AlterTable
ALTER TABLE "redirect_links" ADD COLUMN     "target_number" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "transfers" ADD COLUMN     "target_number" TEXT NOT NULL DEFAULT '';

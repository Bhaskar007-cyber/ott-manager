-- DropIndex
DROP INDEX "Customer_phone_key";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

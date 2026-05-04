/*
  Warnings:

  - A unique constraint covering the columns `[name,price,category,groupId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Plan_name_price_key";

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "groupId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Customer_ottNumber_idx" ON "Customer"("ottNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_price_category_groupId_key" ON "Plan"("name", "price", "category", "groupId");

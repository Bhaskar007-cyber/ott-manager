/*
  Warnings:

  - You are about to drop the column `name` on the `WifiPlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WifiPlan" DROP COLUMN "name",
ADD COLUMN     "image" TEXT;

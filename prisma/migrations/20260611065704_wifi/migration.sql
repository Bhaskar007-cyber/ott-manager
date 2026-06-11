/*
  Warnings:

  - You are about to drop the column `image` on the `WifiPlan` table. All the data in the column will be lost.
  - You are about to drop the column `speed` on the `WifiPlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WifiPlan" DROP COLUMN "image",
DROP COLUMN "speed";

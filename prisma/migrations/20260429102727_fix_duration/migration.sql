/*
  Warnings:

  - The `duration` column on the `Plan` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "duration",
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 30;

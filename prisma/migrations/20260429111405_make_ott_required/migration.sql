/*
  Warnings:

  - Made the column `ottNumber` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "ottNumber" SET NOT NULL;

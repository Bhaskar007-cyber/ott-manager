/*
  Warnings:

  - A unique constraint covering the columns `[name,price]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_price_key" ON "Plan"("name", "price");

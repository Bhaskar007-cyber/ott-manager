-- CreateTable
CREATE TABLE "WifiPlan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "speed" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WifiPlan_pkey" PRIMARY KEY ("id")
);

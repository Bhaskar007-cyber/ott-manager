import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const wifiPlans = await prisma.wifiPlan.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(wifiPlans);
}

export async function POST(req: Request) {
  const body = await req.json();

  const wifiPlan = await prisma.wifiPlan.create({
    data: {
      image: body.image,
      hiddenImage: body.hiddenImage,
    },
  });

  return NextResponse.json(wifiPlan);
}
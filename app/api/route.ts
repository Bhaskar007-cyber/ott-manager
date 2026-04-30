import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [customers, plans] = await Promise.all([
      prisma.customer.findMany({
        orderBy: { id: "desc" },
      }),
      prisma.plan.findMany(),
    ]);

    return NextResponse.json({
      customers,
      plans,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
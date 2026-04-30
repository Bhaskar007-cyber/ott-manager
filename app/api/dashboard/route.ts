import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 10; // ✅ cache for 10 seconds

export async function GET() {
  try {
    const [customers, plans] = await Promise.all([
      prisma.customer.findMany({
        include: { plan: true },
        orderBy: { id: "desc" },
      }),
      prisma.plan.findMany({
        orderBy: { id: "desc" },
      }),
    ]);

    return NextResponse.json({ customers, plans });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
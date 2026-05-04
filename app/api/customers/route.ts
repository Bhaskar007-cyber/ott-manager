import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ================= GET =================
export async function GET() {
  const customers = await prisma.customer.findMany({
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(customers);
}

// ================= CREATE =================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, phone, planId, ottNumber, startDate } = body;

    if (!name || !phone || !planId || !ottNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔥 GET PLAN (IMPORTANT)
    const plan = await prisma.plan.findUnique({
      where: { id: Number(planId) },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    // 🔥 CALCULATE DATES
    const start = startDate ? new Date(startDate) : new Date();

    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + (plan.duration || 30));

    // 🔥 CREATE CUSTOMER
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        planId: Number(planId),
        ottNumber,
        startDate: start,
        expiryDate: expiry,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("CREATE CUSTOMER ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
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

    // 🔥 COUNT EXISTING USAGE
    const existingCount = await prisma.customer.count({
      where: {
        ottNumber: ottNumber,
      },
    });

    // ❌ BLOCK IF MORE THAN 2
    if (existingCount >= 2) {
      return NextResponse.json(
        { error: "This OTT number already used 2 times" },
        { status: 400 }
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

    // ✅ RETURN WITH WARNING INFO (ONLY ADDITION)
    return NextResponse.json({
      customer,
      warning:
        existingCount === 1
          ? "This OTT number is now used 2 times"
          : null,
    });

  } catch (error) {
    console.error("CREATE CUSTOMER ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
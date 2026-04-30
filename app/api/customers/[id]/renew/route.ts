import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // ✅ FIX 1: NO Promise, NO await needed
    const customerId = Number(params.id);

    if (!customerId || isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 1. GET CUSTOMER
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // 2. GET PLAN
    const plan = await prisma.plan.findUnique({
      where: { id: customer.planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // 3. CALCULATE NEW DATES
    const today = new Date();

    const newStartDate =
      new Date(customer.expiryDate) > today
        ? new Date(customer.expiryDate)
        : today;

    const newExpiry = new Date(newStartDate);
    newExpiry.setDate(newExpiry.getDate() + (plan.duration || 30));

    // 4. UPDATE
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        startDate: newStartDate,
        expiryDate: newExpiry,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("RENEW ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
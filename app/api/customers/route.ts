import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ GET all customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        plan: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("CUSTOMERS GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// ✅ ADD customer (FIX FOR YOUR ERROR)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, phone, planId, ottNumber, startDate } = body;

    // 🔒 validation
    if (!name || !phone || !planId || !ottNumber || !startDate) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // ✅ get plan (to calculate expiry)
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 400 }
      );
    }

    // ✅ expiry calculation
    const start = new Date(startDate);
    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + plan.duration);

    // ✅ create customer
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        planId,
        ottNumber,
        startDate: start,
        expiryDate: expiry,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("CUSTOMERS POST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to add customer" },
      { status: 500 }
    );
  }
}
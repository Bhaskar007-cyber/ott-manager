import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

// ================= GET ALL CUSTOMERS =================
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("GET ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// ================= ADD CUSTOMER =================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🔥 NORMALIZE INPUT (VERY IMPORTANT)
    const ottNumber = String(body.ottNumber || "").trim();
    const phone = String(body.phone || "").trim();

    // ✅ VALIDATION
    if (!body.name || !phone || !body.planId || !ottNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔥 STRICT OTT LIMIT CHECK (MAX 2 USERS)
    const existingUsers = await prisma.customer.findMany({
      where: {
        ottNumber: ottNumber,
      },
      select: { id: true },
    });

    if (existingUsers.length >= 2) {
      return NextResponse.json(
        { error: "OTT_LIMIT_EXCEEDED" },
        { status: 400 }
      );
    }

    // 🔥 GET PLAN
    const plan = await prisma.plan.findUnique({
      where: { id: Number(body.planId) },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // ✅ START DATE
    const startDate = body.startDate
      ? new Date(body.startDate)
      : new Date();

    // 🔥 AUTO EXPIRY
    const expiryDate = new Date(startDate);
    expiryDate.setDate(
      expiryDate.getDate() + Number(plan.duration || 0)
    );

    // ✅ CREATE CUSTOMER
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        phone: phone,
        ottNumber: ottNumber,
        planId: Number(body.planId),
        startDate,
        expiryDate,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("POST ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Customer creation failed",
      },
      { status: 500 }
    );
  }
}
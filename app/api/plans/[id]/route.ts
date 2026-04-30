import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ================= UPDATE =================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const planId = Number(id);

    if (!planId || isNaN(planId)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, price, image } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // 🔥 STEP 1: GET ORIGINAL PLAN
    const originalPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!originalPlan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    // 🔥 STEP 2: UPDATE ALL COPIES (VERY IMPORTANT)
    await prisma.plan.updateMany({
      where: {
        name: originalPlan.name,
        price: originalPlan.price,
      },
      data: {
        name,
        price: Number(price),
        image: image ?? null,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("UPDATE ERROR FULL:", error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

// ================= DELETE =================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const planId = Number(id);

    if (!planId || isNaN(planId)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    // 🔥 STEP 1: GET ORIGINAL PLAN
    const originalPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!originalPlan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    // 🔥 STEP 2: DELETE ALL COPIES (IMPORTANT)
    const plansToDelete = await prisma.plan.findMany({
      where: {
        name: originalPlan.name,
        price: originalPlan.price,
      },
    });

    for (const p of plansToDelete) {
      // delete customers linked to each copy
      await prisma.customer.deleteMany({
        where: { planId: p.id },
      });

      await prisma.plan.delete({
        where: { id: p.id },
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DELETE ERROR FULL:", error);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
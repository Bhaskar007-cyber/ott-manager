import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ================= UPDATE =================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ FIX
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

    const originalPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!originalPlan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    // update ALL copies (same name logic)
    await prisma.plan.updateMany({
      where: {
        name: originalPlan.name,
      },
      data: {
        name,
        price: Number(price),
        image: image ?? null,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

// ================= DELETE =================
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ FIX

    const planId = Number(id);

    if (!planId || isNaN(planId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.category === "ALL") {
      await prisma.plan.deleteMany({
        where: { name: plan.name },
      });
    } else {
      await prisma.plan.delete({
        where: { id: planId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
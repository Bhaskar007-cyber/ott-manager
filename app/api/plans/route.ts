import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// ================= GET ALL =================
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// ================= ADD / COPY PLAN =================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name: rawName,
      price: rawPrice,
      image,
      category = "ALL",
      basePlanId, // 🔥 IMPORTANT
    } = body;

    // ================= COPY PLAN =================
    if (basePlanId) {
      const basePlan = await prisma.plan.findUnique({
        where: { id: basePlanId },
      });

      if (!basePlan) {
        return NextResponse.json(
          { error: "Base plan not found" },
          { status: 404 }
        );
      }

      const copied = await prisma.plan.create({
        data: {
          name: basePlan.name,
          price: basePlan.price,
          image: basePlan.image,
          category,
          groupId: basePlan.groupId, // 🔥 SAME GROUP
        },
      });

      return NextResponse.json(copied);
    }

    // ================= CREATE BASE PLAN =================
    const name = rawName?.trim();
    const price = Number(rawPrice);

    if (!name || !price || isNaN(price)) {
      return NextResponse.json(
        { error: "Invalid name or price" },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        price,
        image: image ?? null,
        category: "ALL",
        groupId: randomUUID(), // 🔥 NEW GROUP
      },
    });

    return NextResponse.json(plan);

  } catch (error: unknown) {
    console.error("POST ERROR FULL:", error);

    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Plan already exists in this category" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
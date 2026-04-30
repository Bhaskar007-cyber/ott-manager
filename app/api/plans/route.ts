import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

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

// ================= ADD PLAN =================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ SAFE EXTRACTION (NO REASSIGNMENT ISSUES)
    const rawName = body.name;
    const rawPrice = body.price;
    const image = body.image ?? null;
    const category = body.category ?? "ALL";

    const name = rawName?.trim();
    const price = Number(rawPrice);

    // ✅ VALIDATION
    if (!name || !price || isNaN(price)) {
      return NextResponse.json(
        { error: "Invalid name or price" },
        { status: 400 }
      );
    }

    console.log("CREATING PLAN:", { name, price, category });

    // ✅ CREATE PLAN
    const plan = await prisma.plan.create({
      data: {
        name,
        price,
        image,
        category,
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
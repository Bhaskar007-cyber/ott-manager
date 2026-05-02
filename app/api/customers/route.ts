import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";

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
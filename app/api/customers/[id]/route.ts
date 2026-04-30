import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

// ✅ TYPE SAFE BODY
type UpdateCustomerBody = {
  name?: string;
  phone?: string;
  ottNumber?: string;
  planId?: number;
  startDate?: string;
};

// ================= UPDATE / RENEW CUSTOMER =================
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // ✅ SAFE BODY PARSE
    let body: UpdateCustomerBody = {};
    try {
      body = await req.json();
    } catch {}

    // ✅ GET EXISTING CUSTOMER + PLAN
    const existing = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: { plan: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // ================= 🔥 RENEW =================
    if (!body.name) {
      const newExpiry = new Date(existing.expiryDate);

      // ✅ SAFE duration usage
      const duration = Number(existing.plan?.duration ?? 0);

      newExpiry.setDate(newExpiry.getDate() + duration);

      const updated = await prisma.customer.update({
        where: { id: Number(id) },
        data: {
          expiryDate: newExpiry,
        },
      });

      return NextResponse.json(updated);
    }

    // ================= 🔥 EDIT =================

    // ✅ OTT LIMIT CHECK (max 2 users)
    if (body.ottNumber) {
      const count = await prisma.customer.count({
        where: {
          ottNumber: body.ottNumber,
          NOT: { id: Number(id) },
        },
      });

      if (count >= 2) {
        return NextResponse.json(
          { error: "OTT_LIMIT_EXCEEDED" },
          { status: 400 }
        );
      }
    }

    // ✅ UPDATE
    const updatedCustomer = await prisma.customer.update({
      where: {
        id: Number(id),
      },
      data: {
        name: body.name ?? undefined,
        phone: body.phone ?? undefined,
        ottNumber: body.ottNumber ?? undefined,
        planId: body.planId ? Number(body.planId) : undefined,

        // ✅ FIXED ERROR HERE
        startDate: body.startDate
          ? new Date(String(body.startDate))
          : undefined,
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("PUT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Update failed",
      },
      { status: 500 }
    );
  }
}

// ================= DELETE CUSTOMER =================
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Delete failed",
      },
      { status: 500 }
    );
  }
}
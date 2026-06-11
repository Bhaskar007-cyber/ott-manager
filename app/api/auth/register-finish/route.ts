import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    await prisma.passkey.create({
      data: {
        credentialID: body.id,
        publicKey:
          body.response?.publicKey || "temp",
        counter: 0,
      },
    });

    return NextResponse.json({
      success: true,
      credentialID: body.id,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
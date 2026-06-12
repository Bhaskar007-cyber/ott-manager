import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChallenge } from "@/lib/webauthn";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const passkeys =
      await prisma.passkey.findMany();

    const passkey = passkeys.find(
      (p) => p.credentialID === body.id
    );

    if (!passkey) {
      return NextResponse.json(
        { verified: false },
        { status: 404 }
      );
    }

    console.log(
      "Challenge:",
      getChallenge()
    );

    console.log(
      "PASSKEY:",
      passkey
    );

    return NextResponse.json({
      verified: true,
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        verified: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
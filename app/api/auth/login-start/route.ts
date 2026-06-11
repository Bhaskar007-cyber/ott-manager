import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

export async function GET() {
  const passkey = await prisma.passkey.findFirst();

  if (!passkey) {
    return NextResponse.json(
      { error: "No passkey found" },
      { status: 404 }
    );
  }

  const options =
    await generateAuthenticationOptions({
      rpID: "ott-manager-mu.vercel.app",
      allowCredentials: [
        {
          id: passkey.credentialID,
          transports: ["internal"],
        },
      ],
      userVerification: "required",
    });

  return NextResponse.json(options);
}
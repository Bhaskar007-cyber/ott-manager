import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { setChallenge } from "@/lib/webauthn";

export async function GET() {
  const passkeys =
    await prisma.passkey.findMany();

  if (!passkeys.length) {
    return NextResponse.json(
      { error: "No passkeys found" },
      { status: 404 }
    );
  }

  const options =
    await generateAuthenticationOptions({
      rpID: "ott-manager-mu.vercel.app",

      allowCredentials: passkeys.map(
        (p) => ({
          id: p.credentialID,
          transports: ["internal"],
        })
      ),

      userVerification: "required",
    });

  setChallenge(options.challenge);

  return NextResponse.json(options);
}
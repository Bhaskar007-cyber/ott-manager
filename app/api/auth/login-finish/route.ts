import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
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

    const verification =
      await verifyAuthenticationResponse({
        response: body,

        expectedChallenge:
          getChallenge(),

        expectedOrigin:
          "https://ott-manager-mu.vercel.app",

        expectedRPID:
          "ott-manager-mu.vercel.app",

        credential: {
          id: passkey.credentialID,
          publicKey: new Uint8Array(
            Buffer.from(passkey.publicKey)
          ),
          counter: passkey.counter,
        },
      });

    return NextResponse.json({
      verified: verification.verified,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { verified: false },
      { status: 500 }
    );
  }
}
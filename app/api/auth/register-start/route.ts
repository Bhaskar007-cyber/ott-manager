import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";

export async function GET() {
  const options = await generateRegistrationOptions({
    rpName: "OTT Manager",
    rpID: "ott-manager-mu.vercel.app",
    userID: new Uint8Array([1, 2, 3, 4]),
    userName: "admin",
  });

  return NextResponse.json(options);
}
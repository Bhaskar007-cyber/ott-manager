import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await cloudinary.uploader.upload(body.image, {
      folder: "ott-plans",
    });

    return NextResponse.json({
      url: result.secure_url,
    });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
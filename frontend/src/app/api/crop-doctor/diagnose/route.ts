import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || "development_shared_secret_min_32_chars_long";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Proxy multipart formData directly to FastAPI AI service
    const url = `${AI_SERVICE_BASE_URL}/v1/crop-doctor/diagnose`;
    const fastApiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "X-Service-Key": INTERNAL_SERVICE_KEY
      },
      body: formData
    });

    const data = await fastApiResponse.json();
    return NextResponse.json(data, { status: fastApiResponse.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process leaf image diagnosis" },
      { status: 500 }
    );
  }
}

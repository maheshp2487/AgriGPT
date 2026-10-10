import { NextRequest, NextResponse } from "next/server";
import { callFastApi } from "@/lib/api-client";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const body = await req.json();
    if (!body.phone_number) {
      return NextResponse.json(
        { error: "phone_number is required" },
        { status: 400 }
      );
    }

    // Rate limit: 5 OTP requests per 10 minutes per IP / phone identifier
    const rateCheck = checkRateLimit(`otp_send:${ip}_${body.phone_number}`, 5, 600);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Too many OTP requests. Please wait ${rateCheck.resetInSeconds} seconds before requesting another code.`,
        },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const fastApiResponse = await callFastApi("/v1/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone_number: body.phone_number })
    });

    const data = await fastApiResponse.json();
    return NextResponse.json(data, { status: fastApiResponse.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to send OTP" },
      { status: err.status || 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { callFastApi } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.phone_number || !body.otp) {
      return NextResponse.json(
        { error: "phone_number and otp are required" },
        { status: 400 }
      );
    }

    const fastApiResponse = await callFastApi("/v1/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({
        phone_number: body.phone_number,
        otp: body.otp
      })
    });

    const data = await fastApiResponse.json();
    if (!fastApiResponse.ok) {
      return NextResponse.json(data, { status: fastApiResponse.status });
    }

    // Set secure HTTP-only cookie with bearer token
    const response = NextResponse.json(data, { status: 200 });
    response.cookies.set("agri_auth_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to verify OTP" },
      { status: err.status || 500 }
    );
  }
}

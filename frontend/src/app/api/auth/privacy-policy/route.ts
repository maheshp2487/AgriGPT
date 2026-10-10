import { NextResponse } from "next/server";
import { callFastApi } from "@/lib/api-client";

export async function GET() {
  try {
    const fastApiResponse = await callFastApi("/v1/auth/privacy-policy", {
      method: "GET",
    });
    const data = await fastApiResponse.json();
    return NextResponse.json(data, { status: fastApiResponse.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch DPDP privacy notice" },
      { status: 500 }
    );
  }
}

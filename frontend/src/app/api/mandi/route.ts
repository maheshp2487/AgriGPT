import { NextRequest, NextResponse } from "next/server";
import { callFastApi, ApiError } from "@/lib/api-client";


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get("state");
    const district = searchParams.get("district");
    const commodity = searchParams.get("commodity");

    if (!state || !district || !commodity) {
      return NextResponse.json(
        {
          type: "https://agrigpt.in/errors/invalid-parameters",
          title: "Missing Required Parameters",
          status: 400,
          detail: "Query parameters 'state', 'district', and 'commodity' are all required."
        },
        { status: 400 }
      );
    }

    const queryParams = new URLSearchParams({ state, district, commodity });
    const fastApiResponse = await callFastApi(`/v1/mandi/prices?${queryParams.toString()}`, {
      method: "GET",
      timeoutMs: 8000
    });

    const data = await fastApiResponse.json();
    return NextResponse.json(data, { status: fastApiResponse.status });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          type: "https://agrigpt.in/errors/service-unavailable",
          title: "Provider Service Error",
          status: error.status,
          detail: error.message
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        type: "https://agrigpt.in/errors/internal-error",
        title: "Internal Error",
        status: 500,
        detail: error.message || "An unexpected error occurred in BFF route."
      },
      { status: 500 }
    );
  }
}

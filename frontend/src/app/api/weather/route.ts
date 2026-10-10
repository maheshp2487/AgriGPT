import { NextRequest, NextResponse } from "next/server";
import { callFastApi, ApiError } from "@/lib/api-client";


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const district = searchParams.get("district");
    const state = searchParams.get("state");

    if (!lat || !lon || !district || !state) {
      return NextResponse.json(
        {
          type: "https://agrigpt.in/errors/invalid-parameters",
          title: "Missing Required Parameters",
          status: 400,
          detail: "Query parameters 'lat', 'lon', 'district', and 'state' are all required."
        },
        { status: 400 }
      );
    }

    const queryParams = new URLSearchParams({ lat, lon, district, state });
    const fastApiResponse = await callFastApi(`/v1/weather/forecast?${queryParams.toString()}`, {
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
          title: "Weather Provider Error",
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
        detail: error.message || "An unexpected error occurred in BFF weather route."
      },
      { status: 500 }
    );
  }
}

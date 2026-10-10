import { NextRequest, NextResponse } from "next/server";
import { callFastApi } from "@/lib/api-client";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("agri_auth_token")?.value || req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fastApiResponse = await callFastApi("/v1/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await fastApiResponse.json();
    return NextResponse.json(data, { status: fastApiResponse.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch profile" },
      { status: err.status || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("agri_auth_token")?.value || req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const fastApiResponse = await callFastApi("/v1/auth/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await fastApiResponse.json();
    return NextResponse.json(data, { status: fastApiResponse.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update profile" },
      { status: err.status || 500 }
    );
  }
}

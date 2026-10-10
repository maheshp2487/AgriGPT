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

    const fastApiResponse = await callFastApi("/v1/auth/export-data", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await fastApiResponse.json();
    return NextResponse.json(data, {
      status: fastApiResponse.status,
      headers: {
        "Content-Disposition": 'attachment; filename="agrigpt_farmer_data.json"',
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to export DPDP data" },
      { status: err.status || 500 }
    );
  }
}

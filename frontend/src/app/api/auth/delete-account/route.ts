import { NextRequest, NextResponse } from "next/server";
import { callFastApi } from "@/lib/api-client";
import { cookies } from "next/headers";

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("agri_auth_token")?.value || req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fastApiResponse = await callFastApi("/v1/auth/delete-account", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await fastApiResponse.json();

    // Clear cookie on successful erasure
    cookieStore.delete("agri_auth_token");

    return NextResponse.json(data, { status: fastApiResponse.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to erase account under DPDP Act" },
      { status: err.status || 500 }
    );
  }
}

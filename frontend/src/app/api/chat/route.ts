import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { callFastApi, ApiError } from "@/lib/api-client";


export async function POST(request: NextRequest) {
  try {
    const session = await getOrCreateSession();
    const body = await request.json();

    const { query, locale = "en", crop, district, state, stream = true } = body;

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json(
        {
          type: "https://agrigpt.in/errors/invalid-parameters",
          title: "Invalid Query",
          status: 400,
          detail: "Query string must be at least 2 characters long."
        },
        { status: 400 }
      );
    }

    const payload = {
      query: query.trim(),
      locale,
      crop,
      district,
      state,
      session_id: session.sessionId
    };

    if (stream) {
      const fastApiResponse = await callFastApi("/v1/chat/stream", {
        method: "POST",
        body: JSON.stringify(payload),
        timeoutMs: 25000
      });

      if (!fastApiResponse.ok) {
        const errorJson = await fastApiResponse.json().catch(() => ({}));
        return NextResponse.json(
          {
            type: "https://agrigpt.in/errors/service-error",
            title: "Advisory Service Error",
            status: fastApiResponse.status,
            detail: errorJson.detail || "Advisory service returned an error."
          },
          { status: fastApiResponse.status }
        );
      }

      // Stream SSE chunks through to the client
      return new Response(fastApiResponse.body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "X-Session-Id": session.sessionId
        }
      });
    } else {
      const fastApiResponse = await callFastApi("/v1/chat/completions", {
        method: "POST",
        body: JSON.stringify(payload),
        timeoutMs: 15000
      });

      const data = await fastApiResponse.json();
      return NextResponse.json(data, {
        status: fastApiResponse.status,
        headers: {
          "X-Session-Id": session.sessionId
        }
      });
    }
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          type: "https://agrigpt.in/errors/service-error",
          title: "Service Error",
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
        detail: error.message || "An unexpected error occurred in BFF chat route."
      },
      { status: 500 }
    );
  }
}

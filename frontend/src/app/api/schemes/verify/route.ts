import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || "development_shared_secret_min_32_chars_long";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    
    // Rate limit: 20 scheme verification requests per minute per IP
    const rateCheck = checkRateLimit(`schemes_verify:${ip}`, 20, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          type: "https://agrigpt.in/errors/rate-limit-exceeded",
          title: "Too Many Requests",
          status: 429,
          detail: `Rate limit exceeded. Please retry after ${rateCheck.resetInSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.resetInSeconds),
            "X-RateLimit-Limit": String(rateCheck.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const correlationId = req.headers.get("x-correlation-id") || `corr_bff_${crypto.randomUUID().slice(0, 12)}`;
    const body = await req.json();

    if (!body.scheme || !body.beneficiary_id || !body.state || !body.district) {
      return NextResponse.json(
        {
          type: "https://agrigpt.in/errors/invalid-parameters",
          title: "Missing Required Fields",
          status: 400,
          detail: "Scheme, beneficiary ID, state, and district are mandatory.",
        },
        { status: 400 }
      );
    }

    const url = `${AI_SERVICE_BASE_URL}/v1/apisetu/verify`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Key": INTERNAL_SERVICE_KEY,
        "X-Correlation-ID": correlationId,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "X-Correlation-ID": correlationId,
        "X-RateLimit-Limit": String(rateCheck.limit),
        "X-RateLimit-Remaining": String(rateCheck.remaining),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        type: "https://agrigpt.in/errors/gateway-timeout",
        title: "API Setu Gateway Error",
        status: 502,
        detail: err.message || "Failed to reach backend verification service.",
      },
      { status: 502 }
    );
  }
}

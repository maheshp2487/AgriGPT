const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || "development_shared_secret_min_32_chars_long";

export interface ApiClientOptions {
  timeoutMs?: number;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

/**
 * Server-to-server proxy caller from Next.js BFF to FastAPI AI Service.
 * Internal credentials never reach the client browser.
 */
export async function callFastApi(
  path: string,
  options: RequestInit & ApiClientOptions = {}
): Promise<Response> {
  const { timeoutMs = 12000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${AI_SERVICE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(fetchOptions.headers);
  headers.set("X-Service-Key", INTERNAL_SERVICE_KEY);
  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal
    });
    return response;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new ApiError(504, `Gateway timeout while contacting AI service at ${path}`);
    }
    throw new ApiError(502, `Failed to reach internal AI service: ${error.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

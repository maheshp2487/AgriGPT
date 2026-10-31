import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "agri_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "agrigpt_dev_session_secret_change_in_production_32char";

export interface SessionData {
  sessionId: string;
  isNew: boolean;
}

/**
 * Creates an HMAC signature for a session ID.
 */
function signSessionId(sessionId: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(sessionId);
  return `${sessionId}.${hmac.digest("hex")}`;
}

/**
 * Verifies and parses a signed session cookie value.
 * Returns the sessionId if valid, or null if tampered/invalid.
 */
function verifySessionCookie(signedValue: string): string | null {
  const parts = signedValue.split(".");
  if (parts.length !== 2) return null;

  const [sessionId, signature] = parts;
  const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET);
  expectedHmac.update(sessionId);
  const expectedSignature = expectedHmac.digest("hex");

  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    if (signatureBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return sessionId;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Retrieves an existing verified guest session or initializes a new cryptographically signed session.
 */
export async function getOrCreateSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (existingCookie) {
    const validSessionId = verifySessionCookie(existingCookie);
    if (validSessionId) {
      return { sessionId: validSessionId, isNew: false };
    }
  }

  // Create new session
  const newSessionId = crypto.randomUUID();
  const signedCookieValue = signSessionId(newSessionId);

  cookieStore.set(SESSION_COOKIE_NAME, signedCookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  return { sessionId: newSessionId, isNew: true };
}

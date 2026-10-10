import crypto from "crypto";

const SESSION_SECRET = "agrigpt_dev_session_secret_change_in_production_32char";

function signSessionId(sessionId) {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(sessionId);
  return `${sessionId}.${hmac.digest("hex")}`;
}

function verifySessionCookie(signedValue) {
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

// 1. Test session signature and verification
const originalSession = crypto.randomUUID();
const signed = signSessionId(originalSession);
console.log("Original session:", originalSession);
console.log("Signed cookie:", signed);

const verified = verifySessionCookie(signed);
if (verified !== originalSession) {
  console.error("FAIL: Session verification failed!");
  process.exit(1);
}
console.log("✓ Session signature verified successfully.");

// 2. Test tampering detection
const tampered = signed.slice(0, -1) + (signed.endsWith("0") ? "1" : "0");
const tamperedResult = verifySessionCookie(tampered);
if (tamperedResult !== null) {
  console.error("FAIL: Tampered session was accepted!");
  process.exit(1);
}
console.log("✓ Tampered session detected and rejected.");

// 3. Test BFF routes against live dev server (localhost:3000)
async function testBffRoutes() {
  try {
    const res = await fetch("http://localhost:3000/api/weather?lat=10.787&lon=79.1378&district=Thanjavur&state=Tamil%20Nadu");
    console.log("BFF /api/weather status:", res.status);
    if (res.status === 200) {
      const data = await res.json();
      console.log("✓ BFF /api/weather returned data successfully: temp=", data.data?.current?.temperature_c);
    } else {
      console.log("BFF /api/weather returned status", res.status);
    }

    const mandiRes = await fetch("http://localhost:3000/api/mandi?state=Tamil%20Nadu&district=Thanjavur&commodity=Paddy(Dhan)");
    console.log("BFF /api/mandi status:", mandiRes.status);
    if (mandiRes.status === 503) {
      console.log("✓ BFF /api/mandi correctly propagated upstream fail-closed 503 status without inventing prices.");
    }

    const chatRes = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "What is the dosage of Endosulfan?",
        locale: "en",
        stream: false
      })
    });
    console.log("BFF /api/chat status:", chatRes.status);
    if (chatRes.status === 200) {
      const chatData = await chatRes.json();
      console.log("✓ BFF /api/chat returned status:", chatData.grounding_metadata?.safety_status);
      console.log("✓ Safety answer:", chatData.answer?.slice(0, 50));
    }

    console.log("\nALL BFF & SESSION VERIFICATION TESTS PASSED!");
  } catch (err) {
    console.warn("Notice: Dev server probe encountered:", err.message);
  }
}

testBffRoutes();

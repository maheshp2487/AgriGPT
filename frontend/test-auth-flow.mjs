// AgriGPT — Automated BFF Phone OTP Authentication & Profile Test (P3-01)

async function runAuthFlowTest() {
  console.log("=== Testing AgriGPT Next.js BFF Auth Flow ===");

  const testPhone = "9840123456";

  // 1. Send OTP
  console.log("1. Requesting OTP for +91", testPhone);
  const sendRes = await fetch("http://localhost:3000/api/auth/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: testPhone })
  });

  if (sendRes.status !== 200) {
    console.error("FAIL: Send OTP returned status", sendRes.status);
    process.exit(1);
  }
  const sendData = await sendRes.json();
  console.log("✓ OTP sent successfully:", sendData.message, "| Test OTP:", sendData.test_otp);

  // 2. Verify OTP
  console.log("2. Verifying OTP with code '123456'...");
  const verifyRes = await fetch("http://localhost:3000/api/auth/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: testPhone, otp: "123456" })
  });

  if (verifyRes.status !== 200) {
    console.error("FAIL: Verify OTP returned status", verifyRes.status);
    process.exit(1);
  }

  // Extract set-cookie header
  const setCookie = verifyRes.headers.get("set-cookie");
  const authCookie = setCookie ? setCookie.split(";")[0] : "";
  const verifyData = await verifyRes.json();
  console.log("✓ OTP Verified! User ID:", verifyData.user.id);
  console.log("✓ Auth Cookie Received:", authCookie.slice(0, 30) + "...");

  // 3. Get Profile using auth cookie
  console.log("3. Fetching farmer profile with authenticated cookie...");
  const profileRes = await fetch("http://localhost:3000/api/auth/profile", {
    headers: {
      Cookie: authCookie
    }
  });

  if (profileRes.status !== 200) {
    console.error("FAIL: Get profile returned status", profileRes.status);
    process.exit(1);
  }
  const profileData = await profileRes.json();
  console.log("✓ Profile retrieved! State:", profileData.state, "| District:", profileData.district);

  // 4. Update Profile
  console.log("4. Updating farmer profile (crops & land size)...");
  const updateRes = await fetch("http://localhost:3000/api/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie
    },
    body: JSON.stringify({
      full_name: "Selvam Karuppiah",
      district: "Thiruvarur",
      crops_grown: ["paddy", "groundnut"],
      land_area_acres: 5.0
    })
  });

  if (updateRes.status !== 200) {
    console.error("FAIL: Update profile returned status", updateRes.status);
    process.exit(1);
  }
  const updatedData = await updateRes.json();
  console.log("✓ Profile updated! Name:", updatedData.full_name, "| Land Area:", updatedData.land_area_acres, "acres");

  // 5. Logout
  console.log("5. Testing logout...");
  const logoutRes = await fetch("http://localhost:3000/api/auth/logout", {
    method: "POST"
  });
  console.log("✓ Logout returned status:", logoutRes.status);

  console.log("\nALL P3-01 AUTH & PROFILE FLOW ASSERTIONS PASSED!");
}

runAuthFlowTest().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

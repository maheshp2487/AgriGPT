// AgriGPT — Automated BFF Crop Doctor Image Diagnosis Test (P3-05)

async function testCropDoctorFlow() {
  console.log("=== Testing AgriGPT Next.js BFF Crop Doctor Image Diagnosis ===");

  // Create mock JPEG bytes buffer
  const mockJpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const mockPayload = Buffer.from("blast_disease_paddy_leaf_sample_test_image_data_".repeat(20));
  const mockFileBuffer = Buffer.concat([mockJpegHeader, mockPayload]);

  const formData = new FormData();
  const blob = new Blob([mockFileBuffer], { type: "image/jpeg" });
  formData.append("file", blob, "paddy_blast_leaf.jpg");
  formData.append("crop_hint", "paddy");
  formData.append("locale", "en");

  console.log("1. Sending multipart leaf image to BFF /api/crop-doctor/diagnose...");
  const response = await fetch("http://localhost:3000/api/crop-doctor/diagnose", {
    method: "POST",
    body: formData
  });

  console.log("Response HTTP status:", response.status);
  if (response.status !== 200) {
    const errText = await response.text();
    console.error("FAIL: Diagnosis returned error:", errText);
    process.exit(1);
  }

  const result = await response.json();
  console.log("✓ Diagnostic Result Received!");
  console.log("  Crop:", result.crop);
  console.log("  Pest / Disease:", result.detected_pest_disease);
  console.log("  Confidence:", result.confidence, `(${result.confidence_level})`);
  console.log("  Recommended Chemical:", result.recommended_chemical);
  console.log("  Pre-Harvest Interval (PHI):", result.pre_harvest_interval_days, "days");
  console.log("  CIBRC Safety Status:", result.cibrc_safety_status);
  console.log("  Citations Count:", result.citations?.length || 0);
  console.log("  Disclaimer:", result.mandatory_field_disclaimer?.slice(0, 70) + "...");

  if (!result.detected_pest_disease || result.confidence < 0.70) {
    console.error("FAIL: Diagnosis confidence or pest name missing!");
    process.exit(1);
  }

  console.log("\nALL P3-05 CROP DOCTOR FLOW ASSERTIONS PASSED!");
}

testCropDoctorFlow().catch(err => {
  console.error("Crop doctor test failed:", err);
  process.exit(1);
});

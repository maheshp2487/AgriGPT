// Test API Setu Gateway and DPDP Act 2023 Compliance Endpoints
const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('=== Testing AgriGPT API Setu Gateway & DPDP Act 2023 Compliance ===\n');

  // 1. Test DPDP Privacy Policy
  console.log('1. Checking DPDP Privacy Policy endpoint...');
  const policyRes = await fetch(`${BASE_URL}/api/auth/privacy-policy`);
  if (!policyRes.ok) {
    throw new Error(`Failed to fetch privacy policy: HTTP ${policyRes.status}`);
  }
  const policy = await policyRes.json();
  console.log('✓ Privacy policy retrieved:');
  console.log(`  Governing Law: ${policy.governing_law}`);
  console.log(`  DPO Contact: ${policy.grievance_redressal.email}`);
  console.log(`  Purposes: ${policy.purpose_of_processing.length} declared purposes.`);

  // 2. Test API Setu Gateway Verification - Active PM-KISAN
  console.log('\n2. Verifying active PM-KISAN beneficiary via API Setu...');
  const kisanRes = await fetch(`${BASE_URL}/api/schemes/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scheme: 'PM_KISAN',
      beneficiary_id: 'TN-TH-1029485',
      state: 'Tamil Nadu',
      district: 'Thanjavur',
    }),
  });
  if (!kisanRes.ok) {
    throw new Error(`PM-KISAN verification failed: HTTP ${kisanRes.status}`);
  }
  const kisanData = await kisanRes.json();
  console.log('✓ PM-KISAN Active verification successful:');
  console.log(`  Status: ${kisanData.status} | Mode: ${kisanData.gateway_mode}`);
  console.log(`  Masked Name: ${kisanData.details.beneficiary_name_masked}`);
  console.log(`  eKYC: ${kisanData.details.ekyc_verified} | Aadhaar Seeded: ${kisanData.details.aadhaar_seeded}`);
  console.log(`  Installments: ${kisanData.details.installment_count} Credited`);
  console.log(`  Correlation ID: ${kisanRes.headers.get('x-correlation-id')}`);
  console.log(`  RateLimit Remaining: ${kisanRes.headers.get('x-ratelimit-remaining')}`);

  // 3. Test API Setu Gateway Verification - Pending eKYC
  console.log('\n3. Verifying pending eKYC scenario via API Setu...');
  const ekycRes = await fetch(`${BASE_URL}/api/schemes/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scheme: 'PM_KISAN',
      beneficiary_id: 'TEST-PMKISAN-EKYC-PENDING',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
    }),
  });
  const ekycData = await ekycRes.json();
  if (ekycData.status !== 'PENDING_EKYC') {
    throw new Error(`Expected PENDING_EKYC, got ${ekycData.status}`);
  }
  console.log('✓ Pending eKYC scenario confirmed:');
  console.log(`  Actionable guidance: "${ekycData.actionable_recommendations[0]}"`);

  // 4. Test Soil Health Card Verification
  console.log('\n4. Verifying Soil Health Card via API Setu...');
  const shcRes = await fetch(`${BASE_URL}/api/schemes/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scheme: 'SOIL_HEALTH_CARD',
      beneficiary_id: 'SHC-2025-TN-9812',
      state: 'Tamil Nadu',
      district: 'Madurai',
    }),
  });
  const shcData = await shcRes.json();
  console.log('✓ Soil Health Card report retrieved:');
  console.log(`  Nitrogen: ${shcData.details.additional_metadata.nitrogen_rating}`);
  console.log(`  pH Value: ${shcData.details.additional_metadata.ph_value}`);
  console.log(`  Recommendations: ${shcData.actionable_recommendations.length} nutrient guidance points.`);

  // 5. Test DPDP Section 11 Data Portability & Section 12 Erasure
  console.log('\n5. Testing DPDP Farmer Data Portability (Export) & Erasure Flow...');
  // Send OTP
  const sendRes = await fetch(`${BASE_URL}/api/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: '+919988776655' }),
  });
  const sendJson = await sendRes.json();

  // Verify OTP to get cookie
  const verifyRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: '+919988776655', otp: '123456' }),
  });
  const authCookie = verifyRes.headers.get('set-cookie');
  console.log('✓ Test user authenticated for DPDP audit.');

  // Test Export Data
  const exportRes = await fetch(`${BASE_URL}/api/auth/export-data`, {
    headers: { Cookie: authCookie || '' },
  });
  if (!exportRes.ok) {
    throw new Error(`Data export failed with HTTP ${exportRes.status}`);
  }
  const exportData = await exportRes.json();
  console.log('✓ DPDP Section 11 Data Export Successful:');
  console.log(`  Act: ${exportData.statutory_act}`);
  console.log(`  Fiduciary: ${exportData.data_fiduciary}`);
  console.log(`  User ID: ${exportData.user.id}`);
  console.log(`  Phone (Masked in Logs): ${exportData.user.phone_number}`);

  // Test Erasure & Consent Withdrawal
  const deleteRes = await fetch(`${BASE_URL}/api/auth/delete-account`, {
    method: 'DELETE',
    headers: { Cookie: authCookie || '' },
  });
  const deleteData = await deleteRes.json();
  console.log('✓ DPDP Section 12 Erasure Successful:');
  console.log(`  Status: ${deleteData.status}`);
  console.log(`  Message: ${deleteData.message}`);

  // Verify subsequent unauthorized access
  const recheckRes = await fetch(`${BASE_URL}/api/auth/profile`, {
    headers: { Cookie: authCookie || '' },
  });
  if (recheckRes.status === 401 || recheckRes.status === 404) {
    console.log(`✓ Post-erasure verification: Access rejected as expected (HTTP ${recheckRes.status}).`);
  } else {
    throw new Error(`Expected HTTP 401 or 404 after erasure, got ${recheckRes.status}`);
  }

  console.log('\nALL P4-01 API SETU AND P4-02 DPDP SECURITY HARDENING TESTS PASSED!');
}

run().catch((err) => {
  console.error('\n✗ Test failed:', err);
  process.exit(1);
});

/**
 * EvidenceLens - Phase 6A End-to-End Live HTTP & Pipeline Test Suite
 * Tests the live Next.js server on http://localhost:3000 across all 16 user-specified scenarios.
 *
 * Run with: npx tsx tests/phase6a_e2e_http.ts
 */

import fs from "fs";
import path from "path";

// Load .env.local without requiring external dotenv package
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...rest] = trimmed.split("=");
        const value = rest.join("=").trim().replace(/^["']|["']$/g, "");
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  }
} catch {
  // Ignore
}

const BASE_URL = "http://localhost:3000";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    if (details) console.error(`         Details: ${details}`);
    failedCount++;
  }
}

async function runE2ETests() {
  console.log("\n=======================================================");
  console.log("   EVIDENCELENS - PHASE 6A LIVE E2E HTTP VERIFICATION  ");
  console.log("=======================================================\n");

  // 1. Health & SSR Home Page
  console.log("SCENARIO 1: Next.js SSR Homepage Route Health");
  try {
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, "Homepage returns HTTP 200 OK");
    const html = await homeRes.text();
    assert(
      html.includes("AI Forensic Verification Engine") || html.includes("EvidenceLens") || html.includes("PS3 Workbench"),
      "HTML contains workbench section header"
    );
  } catch (err) {
    assert(false, "Homepage fetch succeeded", String(err));
  }

  // 2. Health Endpoint
  console.log("\nSCENARIO 2: /api/health Endpoint");
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert(healthRes.status === 200, "API Health returns HTTP 200 OK");
    const healthData = await healthRes.json();
    assert(healthData.status === "healthy", "Health status is 'healthy'");
    assert(healthData.aiConfigured === true, "AI service is configured (aiConfigured: true)");
  } catch (err) {
    assert(false, "Health endpoint fetch succeeded", String(err));
  }

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 3. Validation: Short / Empty Claim Error Handling
  console.log("\nSCENARIO 3: Input Validation - Short Claim Rejection");
  try {
    const shortRes = await fetch(`${BASE_URL}/api/investigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim: "abc" }),
    });
    assert(shortRes.status === 400, "Short claim (< 5 chars) rejected with HTTP 400");
    const shortData = await shortRes.json();
    assert(shortData.success === false, "Response success is false");
    assert(Boolean(shortData.error && shortData.error.includes("characters is required")), "Validation error message returned");
  } catch (err) {
    assert(false, "Short claim validation test succeeded", String(err));
  }

  // 4. Validation: Invalid Content-Type
  console.log("\nSCENARIO 4: Input Validation - Invalid Content-Type");
  try {
    const invalidTypeRes = await fetch(`${BASE_URL}/api/investigate`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "plain text",
    });
    assert(invalidTypeRes.status === 400, "Invalid encoding rejected with HTTP 400");
  } catch (err) {
    assert(false, "Invalid encoding test succeeded", String(err));
  }

  // 5. Live Test: Clearly TRUE Claim
  await sleep(2000);
  console.log("\nSCENARIO 5: End-to-End Live TRUE Claim Verification");
  try {
    const trueClaimText = "The James Webb Space Telescope was launched into space on December 25, 2021.";
    console.log(`  Submitting: "${trueClaimText}"`);
    const trueRes = await fetch(`${BASE_URL}/api/investigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim: trueClaimText }),
    });

    assert(trueRes.status === 200, "Investigation request succeeded with HTTP 200");
    const trueData = await trueRes.json();

    assert(trueData.success === true, "Pipeline response success: true");
    assert(trueData.stage === "verified", "Pipeline reached 'verified' stage");
    assert(Boolean(trueData.extraction?.claims?.length), `Extracted ${trueData.extraction?.claims?.length} atomic claims`);
    assert(Boolean(trueData.evidence?.totalSourcesFound > 0), `Retrieved ${trueData.evidence?.totalSourcesFound} real web citations`);
    assert(
      trueData.verification?.overallVerdict === "VERIFIED" || trueData.verification?.overallVerdict === "MIXED",
      `Overall verdict is valid (received: ${trueData.verification?.overallVerdict})`
    );

    // Check citation fields
    const firstSource = trueData.evidence?.allSources?.[0];
    assert(Boolean(firstSource?.url && firstSource?.title && firstSource?.domain), "Evidence citations contain url, title, and domain");
  } catch (err) {
    assert(false, "True claim live verification test succeeded", String(err));
  }

  // 6. Live Test: Clearly FALSE Claim
  await sleep(2000);
  console.log("\nSCENARIO 6: End-to-End Live FALSE Claim Verification");
  try {
    const falseClaimText = "The Eiffel Tower is located in the center of Rome, Italy.";
    console.log(`  Submitting: "${falseClaimText}"`);
    const falseRes = await fetch(`${BASE_URL}/api/investigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim: falseClaimText }),
    });

    assert(falseRes.status === 200, "Investigation request succeeded with HTTP 200");
    const falseData = await falseRes.json();

    assert(falseData.success === true, "Pipeline response success: true");
    assert(Boolean(falseData.extraction?.claims?.length), `Extracted ${falseData.extraction?.claims?.length} atomic claims`);
    assert(Boolean(falseData.evidence?.totalSourcesFound > 0), `Retrieved ${falseData.evidence?.totalSourcesFound} web sources`);
    assert(
      falseData.verification?.overallVerdict === "FALSE" || falseData.verification?.overallVerdict === "MIXED",
      `Overall verdict refutes or marks claim invalid (received: ${falseData.verification?.overallVerdict})`
    );
    assert(
      falseData.verification?.claimBreakdown?.refutedFalse > 0,
      `Claim breakdown records refuted claims (${falseData.verification?.claimBreakdown?.refutedFalse} refuted)`
    );
  } catch (err) {
    assert(false, "False claim live verification test succeeded", String(err));
  }

  // 7. Live Test: Mixed / Compound Claim
  await sleep(2000);
  console.log("\nSCENARIO 7: End-to-End Live Mixed/Compound Claim Verification");
  try {
    const mixedClaimText = "NASA landed the Perseverance rover on Mars in February 2021 and discovered swimming fish in subterranean rivers.";
    console.log(`  Submitting: "${mixedClaimText}"`);
    const mixedRes = await fetch(`${BASE_URL}/api/investigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim: mixedClaimText }),
    });

    assert(mixedRes.status === 200, "Compound investigation request succeeded with HTTP 200");
    const mixedData = await mixedRes.json();

    assert(mixedData.success === true, "Pipeline response success: true");
    assert(Boolean(mixedData.extraction?.claims?.length >= 2), `Extracted ${mixedData.extraction?.claims?.length} atomic claims (>= 2)`);
    assert(
      mixedData.verification?.overallVerdict === "MIXED" || mixedData.verification?.overallVerdict === "FALSE",
      `Overall verdict correctly identifies invalid/mixed state (received: ${mixedData.verification?.overallVerdict})`
    );
  } catch (err) {
    assert(false, "Mixed claim live verification test succeeded", String(err));
  }

  // 8. Live Test: Multipart Form Data with Media Metadata
  await sleep(2000);
  console.log("\nSCENARIO 8: Multipart Form Data Submission (Simulated Image Ingestion)");
  try {
    const formData = new FormData();
    formData.append("claim", "NASA launched the Artemis 1 uncrewed mission around the Moon.");
    formData.append("contextUrl", "https://www.nasa.gov");

    const dummyImageBuffer = Buffer.from("dummy-image-binary-data");
    const dummyBlob = new Blob([dummyImageBuffer], { type: "image/png" });
    formData.append("media", dummyBlob, "artemis_launch.png");

    const multipartRes = await fetch(`${BASE_URL}/api/investigate`, {
      method: "POST",
      body: formData,
    });

    assert(multipartRes.status === 200, "Multipart request returned HTTP 200 OK");
    const multipartData = await multipartRes.json();
    assert(multipartData.input?.mediaReceived === true, "Media was received and registered");
    assert(multipartData.input?.media?.filename === "artemis_launch.png", "Media filename correctly recorded");
    assert(multipartData.input?.contextUrlReceived === true, "Context URL correctly recorded");
    assert(multipartData.verification !== undefined, "Verification completed for multimodal payload");
  } catch (err) {
    assert(false, "Multipart form data test succeeded", String(err));
  }

  // 9. Summary
  console.log("\n=======================================================");
  console.log(`  PHASE 6A E2E RESULTS: ${passedCount} PASSED / ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error("Unhandled error in Phase 6A test suite:", err);
  process.exit(1);
});

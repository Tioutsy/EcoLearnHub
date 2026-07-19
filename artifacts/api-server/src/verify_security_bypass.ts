import { spawn } from "child_process";

const TEST_USER_ID = "user_security_audit";
const TEST_EMAIL = "security-audit@ecolearn.mu";

const HEADERS = {
  "x-test-user-id": TEST_USER_ID,
  "x-test-user-email": TEST_EMAIL,
  "Content-Type": "application/json",
};

async function testServerInstance(env: Record<string, string>, port: string, expectedStatus: number): Promise<void> {
  const server = spawn(process.execPath, ["./dist/index.mjs"], {
    env: {
      ...process.env,
      PORT: port,
      ...env,
    },
    cwd: "/Users/sharonlennon/Desktop/Elearn-Hub copy/artifacts/api-server"
  });

  server.stdout.on("data", (data) => {
    // console.log(`[SERVER ${port} STDOUT] ${data.toString().trim()}`);
  });
  server.stderr.on("data", (data) => {
    // console.error(`[SERVER ${port} STDERR] ${data.toString().trim()}`);
  });

  // Wait for server to listen
  let connected = false;
  let checkRes = null;
  
  for (let attempt = 1; attempt <= 40; attempt++) {
    try {
      checkRes = await fetch(`http://localhost:${port}/api/platform-admin/courses`, {
        headers: HEADERS,
      });
      connected = true;
      break;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  try {
    if (!connected || !checkRes) {
      throw new Error(`Failed to establish connection with server instance on port ${port}`);
    }

    console.log(`- Port ${port} (${env.NODE_ENV}, ENABLE_TEST_AUTH_BYPASS=${env.ENABLE_TEST_AUTH_BYPASS || "absent"}): Actual status ${checkRes.status} (Expected: ${expectedStatus})`);
    
    if (checkRes.status !== expectedStatus) {
      throw new Error(`Security validation FAILED on port ${port}! Expected status ${expectedStatus}, but got ${checkRes.status}`);
    }
  } finally {
    server.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 3000)); // release port
  }
}

async function runSecurityAudit() {
  console.log("\n=== STARTING SECURITY REGRESSION INTEGRATION TESTS ===");

  // Case 1: Protected endpoint rejects mock-only auth in production (even with flag true)
  console.log("1. Verifying production mode block (expected 401/403)...");
  await testServerInstance({
    NODE_ENV: "production",
    ENABLE_TEST_AUTH_BYPASS: "true",
  }, "8091", 401);

  // Case 2: Protected endpoint rejects mock-only auth in development when flag is false
  console.log("2. Verifying development mode block when ENABLE_TEST_AUTH_BYPASS=false (expected 401/403)...");
  await testServerInstance({
    NODE_ENV: "development",
    ENABLE_TEST_AUTH_BYPASS: "false",
  }, "8092", 401);

  // Case 3: Protected endpoint rejects mock-only auth in development when flag is missing
  console.log("3. Verifying development mode block when ENABLE_TEST_AUTH_BYPASS is absent (expected 401/403)...");
  await testServerInstance({
    NODE_ENV: "development",
  }, "8093", 401);

  console.log("=== ALL SECURITY INTEGRATION TESTS PASSED ===");
}

runSecurityAudit().catch((err) => {
  console.error("\n=== SECURITY INTEGRATION TESTS FAILED ===");
  console.error(err);
  process.exit(1);
});

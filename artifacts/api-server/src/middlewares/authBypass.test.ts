import assert from "node:assert/strict";
import test from "node:test";
import type { Response, NextFunction } from "express";
import { authBypassMiddleware, type AuthRequest } from "./authBypass";

function createMockReq(headers: Record<string, string>): AuthRequest {
  return {
    headers,
    method: "GET",
    url: "/",
  } as unknown as AuthRequest;
}

const mockRes = {} as Response;

test("authBypassMiddleware: bypasses Clerk when flag is true and environment is development", () => {
  const origEnv = process.env.NODE_ENV;
  const origFlag = process.env.ENABLE_TEST_AUTH_BYPASS;

  process.env.NODE_ENV = "development";
  process.env.ENABLE_TEST_AUTH_BYPASS = "true";

  try {
    const req = createMockReq({
      "x-test-user-id": "test-user-123",
      "x-test-user-email": "test@ecolearn.mu",
    });

    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    authBypassMiddleware(req, mockRes, next);

    assert.equal(nextCalled, true);
    assert.ok(req.auth);
    assert.equal(req.auth.userId, "test-user-123");
    assert.equal(req.auth.sessionClaims?.email, "test@ecolearn.mu");
  } finally {
    process.env.NODE_ENV = origEnv;
    process.env.ENABLE_TEST_AUTH_BYPASS = origFlag;
  }
});

test("authBypassMiddleware: does not bypass Clerk when flag is missing", () => {
  const origEnv = process.env.NODE_ENV;
  const origFlag = process.env.ENABLE_TEST_AUTH_BYPASS;

  process.env.NODE_ENV = "development";
  delete process.env.ENABLE_TEST_AUTH_BYPASS;

  try {
    const req = createMockReq({
      "x-test-user-id": "test-user-123",
    });

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    authBypassMiddleware(req, mockRes, next);

    assert.equal(nextCalled, true);
    assert.equal(req.auth, undefined);
  } finally {
    process.env.NODE_ENV = origEnv;
    process.env.ENABLE_TEST_AUTH_BYPASS = origFlag;
  }
});

test("authBypassMiddleware: does not bypass Clerk when flag is false", () => {
  const origEnv = process.env.NODE_ENV;
  const origFlag = process.env.ENABLE_TEST_AUTH_BYPASS;

  process.env.NODE_ENV = "development";
  process.env.ENABLE_TEST_AUTH_BYPASS = "false";

  try {
    const req = createMockReq({
      "x-test-user-id": "test-user-123",
    });

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    authBypassMiddleware(req, mockRes, next);

    assert.equal(nextCalled, true);
    assert.equal(req.auth, undefined);
  } finally {
    process.env.NODE_ENV = origEnv;
    process.env.ENABLE_TEST_AUTH_BYPASS = origFlag;
  }
});

test("authBypassMiddleware: never bypasses Clerk in production, even if flag is true", () => {
  const origEnv = process.env.NODE_ENV;
  const origFlag = process.env.ENABLE_TEST_AUTH_BYPASS;

  process.env.NODE_ENV = "production";
  process.env.ENABLE_TEST_AUTH_BYPASS = "true";

  try {
    const req = createMockReq({
      "x-test-user-id": "test-user-123",
    });

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    authBypassMiddleware(req, mockRes, next);

    assert.equal(nextCalled, true);
    assert.equal(req.auth, undefined);
  } finally {
    process.env.NODE_ENV = origEnv;
    process.env.ENABLE_TEST_AUTH_BYPASS = origFlag;
  }
});

test("authBypassMiddleware: does not override existing genuine Clerk auth", () => {
  const origEnv = process.env.NODE_ENV;
  const origFlag = process.env.ENABLE_TEST_AUTH_BYPASS;

  process.env.NODE_ENV = "development";
  process.env.ENABLE_TEST_AUTH_BYPASS = "true";

  try {
    const req = createMockReq({
      "x-test-user-id": "test-user-123",
    });
    req.auth = {
      userId: "genuine-clerk-user",
      sessionClaims: { email: "genuine@clerk.com" }
    };

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    authBypassMiddleware(req, mockRes, next);

    assert.equal(nextCalled, true);
    assert.ok(req.auth);
    assert.equal(req.auth.userId, "genuine-clerk-user");
  } finally {
    process.env.NODE_ENV = origEnv;
    process.env.ENABLE_TEST_AUTH_BYPASS = origFlag;
  }
});

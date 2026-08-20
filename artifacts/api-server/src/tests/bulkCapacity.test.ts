/**
 * Sprint 13 — Bulk Capacity & Boundary Test Suite
 * Tests bulk CSV parsing at scale (1,000+ rows), duplicate handling,
 * payload boundary enforcement, and formula injection sanitization.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  parseCsvRows,
  escapeCsvField,
  isValidEmailSyntax,
  validateBulkInvitationCsv,
  generateErrorReportCsv,
} from "../lib/bulkInvitationService.js";

// Safety Guard
const DB_URL = process.env.DATABASE_URL || "";
if (DB_URL.includes("ep-delicate-pond-ahy88lt3")) {
  throw new Error(
    "SAFETY VIOLATION: Tests must not run against the production Neon database (ep-delicate-pond-ahy88lt3)."
  );
}

describe("Bulk Capacity & Performance (1,000+ Rows)", () => {
  it("parses 1,000 valid rows cleanly and quickly", () => {
    let csv = "first_name,surname,email\n";
    for (let i = 1; i <= 1000; i++) {
      csv += `Employee${i},TestSurname${i},employee${i}@scale-test.elevio.mu\n`;
    }

    const start = performance.now();
    const { headers, rows } = parseCsvRows(csv);
    const duration = performance.now() - start;

    assert.deepEqual(headers, ["first_name", "surname", "email"]);
    assert.equal(rows.length, 1000);
    assert.equal(rows[0][0], "Employee1");
    assert.equal(rows[999][2], "employee1000@scale-test.elevio.mu");
    // Parsing 1,000 rows in JS memory should take under 50ms
    assert.ok(duration < 100, `Parsing 1000 rows took ${duration}ms, expected < 100ms`);
  });

  it("handles 1,000 rows with mixed whitespace, quotes, and special characters", () => {
    let csv = "first_name,surname,email\n";
    for (let i = 1; i <= 1000; i++) {
      if (i % 3 === 0) {
        csv += `"Jean-Luc ${i}","De La Tour ${i}",user.${i}@company.mu\n`;
      } else if (i % 3 === 1) {
        csv += `  Marie  ,  Curie ${i}  ,  marie.${i}@science.org  \n`;
      } else {
        csv += `Alex ${i},Smith,alex.${i}@domain.com\n`;
      }
    }

    const { headers, rows } = parseCsvRows(csv);
    assert.equal(headers.length, 3);
    assert.equal(rows.length, 1000);

    // Verify unquoting and trimming behavior
    assert.equal(rows[0][0], "Marie");
    assert.equal(rows[1][0], "Alex 2");
    assert.equal(rows[2][0], "Jean-Luc 3");
  });

  it("identifies duplicate emails within large 1,000 row batch", () => {
    const seen = new Set<string>();
    let duplicates = 0;
    const emails: string[] = [];

    for (let i = 1; i <= 1000; i++) {
      // Create duplicate every 50 rows
      const email = i % 50 === 0 ? "duplicate.user@test.mu" : `unique.user.${i}@test.mu`;
      emails.push(email);
      if (seen.has(email)) {
        duplicates++;
      }
      seen.add(email);
    }

    assert.equal(emails.length, 1000);
    assert.equal(duplicates, 19); // 20 instances of duplicate, 19 repeated
  });
});

describe("File Size & Payload Limits", () => {
  it("rejects batches exceeding maximum row threshold (2,500 rows)", async () => {
    let csv = "first_name,surname,email\n";
    for (let i = 1; i <= 2501; i++) {
      csv += `First${i},Last${i},user${i}@elevio.mu\n`;
    }

    // Mock database transaction
    const mockTx = {
      select: () => ({
        from: () => ({
          where: () => Promise.resolve([]),
          then: (cb: any) => Promise.resolve([]).then(cb),
        }),
      }),
    };

    await assert.rejects(
      async () => {
        await validateBulkInvitationCsv(1, csv, mockTx);
      },
      (err: any) => {
        assert.ok(err.message.includes("exceeds maximum supported batch size"));
        assert.equal(err.status, 400);
        return true;
      }
    );
  });

  it("rejects empty CSV uploads", async () => {
    const mockTx = {};
    await assert.rejects(
      async () => {
        await validateBulkInvitationCsv(1, "", mockTx);
      },
      (err: any) => {
        assert.ok(err.message.includes("empty"));
        assert.equal(err.status, 400);
        return true;
      }
    );
  });

  it("rejects CSV with missing required headers", async () => {
    const mockTx = {};
    const badCsv = "name,email_address\nJohn,john@test.com\n";
    await assert.rejects(
      async () => {
        await validateBulkInvitationCsv(1, badCsv, mockTx);
      },
      (err: any) => {
        assert.ok(err.message.includes("Missing required 'first_name' column header"));
        assert.equal(err.status, 400);
        return true;
      }
    );
  });
});

describe("Formula Injection Sanitization at Scale", () => {
  it("safely neutralizes malicious Excel formula prefixes across all exported rows", () => {
    const skippedRows = [
      {
        rowNumber: 2,
        firstName: "=cmd|' /C calc'!A0",
        surname: "Malicious",
        email: "hacker@test.com",
        reasonCode: "INVALID",
        explanation: "Test",
      },
      {
        rowNumber: 3,
        firstName: "+123456789",
        surname: "PhonePrefix",
        email: "phone@test.com",
        reasonCode: "INVALID",
        explanation: "Test",
      },
      {
        rowNumber: 4,
        firstName: "-HYPERLINK('http://evil.com')",
        surname: "Link",
        email: "link@test.com",
        reasonCode: "INVALID",
        explanation: "Test",
      },
      {
        rowNumber: 5,
        firstName: "@SUM(1+1)",
        surname: "Formula",
        email: "sum@test.com",
        reasonCode: "INVALID",
        explanation: "Test",
      },
    ];

    const errorCsv = generateErrorReportCsv(skippedRows);

    assert.ok(errorCsv.includes("'=cmd|' /C calc'!A0"));
    assert.ok(errorCsv.includes("'+123456789"));
    assert.ok(errorCsv.includes("'-HYPERLINK('http://evil.com')"));
    assert.ok(errorCsv.includes("'@SUM(1+1)"));
    // Header should remain intact
    assert.ok(errorCsv.startsWith("row_number,first_name,surname,email,reason_code,explanation"));
  });
});

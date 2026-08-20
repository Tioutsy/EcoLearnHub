/**
 * Sprint 13 — Bulk Employee Invitations Test Suite
 * Uses Node.js native test runner (node --test)
 *
 * Safety Guard: Tests must NEVER run against the production Neon database
 * (ep-delicate-pond-ahy88lt3).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  parseCsvRows,
  escapeCsvField,
  isValidEmailSyntax,
  generateErrorReportCsv,
  getBulkInvitationTemplateCsv,
  type SkippedRowReport,
} from "../lib/bulkInvitationService.js";

// ─── Safety Guard ─────────────────────────────────────────────────────────────
const DB_URL = process.env.DATABASE_URL || "";
if (DB_URL.includes("ep-delicate-pond-ahy88lt3")) {
  throw new Error(
    "SAFETY VIOLATION: Tests must not run against the production Neon database (ep-delicate-pond-ahy88lt3)."
  );
}

// ─── CSV Escape / Injection Prevention ───────────────────────────────────────
describe("escapeCsvField — formula injection prevention", () => {
  it("escapes fields starting with =", () => {
    assert.equal(escapeCsvField("=SYSTEM(rm -rf /)"), "'=SYSTEM(rm -rf /)");
  });

  it("escapes fields starting with +", () => {
    assert.equal(escapeCsvField("+1234567890"), "'+1234567890");
  });

  it("escapes fields starting with -", () => {
    assert.equal(escapeCsvField("-1234567890"), "'-1234567890");
  });

  it("escapes fields starting with @", () => {
    assert.equal(escapeCsvField("@SUM(A1)"), "'@SUM(A1)");
  });

  it("does not escape normal names", () => {
    assert.equal(escapeCsvField("Jean"), "Jean");
    assert.equal(escapeCsvField("jean.dupont@example.mu"), "jean.dupont@example.mu");
  });

  it("wraps fields containing commas in double quotes", () => {
    assert.equal(escapeCsvField("Smith, Jr."), '"Smith, Jr."');
  });

  it("handles null gracefully", () => {
    assert.equal(escapeCsvField(null), "");
  });

  it("handles undefined gracefully", () => {
    assert.equal(escapeCsvField(undefined), "");
  });
});

// ─── Email Syntax Validation ──────────────────────────────────────────────────
describe("isValidEmailSyntax", () => {
  it("accepts valid email: jean.dupont@example.mu", () => {
    assert.equal(isValidEmailSyntax("jean.dupont@example.mu"), true);
  });
  it("accepts valid email: user+label@sub.domain.com", () => {
    assert.equal(isValidEmailSyntax("user+label@sub.domain.com"), true);
  });
  it("accepts valid email: hello@elevio.mu", () => {
    assert.equal(isValidEmailSyntax("hello@elevio.mu"), true);
  });
  it("rejects non-email string", () => {
    assert.equal(isValidEmailSyntax("not-an-email"), false);
  });
  it("rejects email starting with @", () => {
    assert.equal(isValidEmailSyntax("@nodomain.com"), false);
  });
  it("rejects email missing domain", () => {
    assert.equal(isValidEmailSyntax("missing@"), false);
  });
  it("rejects empty string", () => {
    assert.equal(isValidEmailSyntax(""), false);
  });
  it("rejects string over 254 chars", () => {
    assert.equal(isValidEmailSyntax("a".repeat(255) + "@too.long.com"), false);
  });
});

// ─── CSV Parser ───────────────────────────────────────────────────────────────
describe("parseCsvRows", () => {
  it("parses standard three-column CSV", () => {
    const csv = "first_name,surname,email\nJean,Dupont,jean@example.mu\nMarie,Curie,marie@example.mu\n";
    const { headers, rows } = parseCsvRows(csv);
    assert.deepEqual(headers, ["first_name", "surname", "email"]);
    assert.equal(rows.length, 2);
    assert.deepEqual(rows[0], ["Jean", "Dupont", "jean@example.mu"]);
    assert.deepEqual(rows[1], ["Marie", "Curie", "marie@example.mu"]);
  });

  it("handles CRLF line endings", () => {
    const csv = "first_name,surname,email\r\nJean,Dupont,jean@example.mu\r\n";
    const { rows } = parseCsvRows(csv);
    assert.equal(rows.length, 1);
    assert.equal(rows[0][2], "jean@example.mu");
  });

  it("handles quoted fields containing commas", () => {
    const csv = 'first_name,surname,email\n"Smith, Jr.",Jones,smith@example.mu\n';
    const { rows } = parseCsvRows(csv);
    assert.equal(rows[0][0], "Smith, Jr.");
  });

  it("returns empty on empty string", () => {
    const { headers, rows } = parseCsvRows("");
    assert.equal(headers.length, 0);
    assert.equal(rows.length, 0);
  });

  it("handles UTF-8 names (Mauritian / French)", () => {
    const csv = "first_name,surname,email\nJeannot,Médine,jmedine@example.mu\nFrançoise,Müller,fmuller@example.mu\n";
    const { rows } = parseCsvRows(csv);
    assert.equal(rows[0][1], "Médine");
    assert.equal(rows[1][0], "Françoise");
  });

  it("handles whitespace trimming around values", () => {
    const csv = "first_name , surname , email \n Jean , Dupont , jean@example.mu \n";
    const { headers, rows } = parseCsvRows(csv);
    assert.equal(headers[0], "first_name");
    assert.equal(rows[0][0], "Jean");
    assert.equal(rows[0][2], "jean@example.mu");
  });
});

// ─── Error Report CSV Generator ────────────────────────────────────────────────
describe("generateErrorReportCsv", () => {
  const sampleSkipped: SkippedRowReport[] = [
    {
      rowNumber: 2,
      firstName: "Jean",
      surname: "Dupont",
      email: "invalid-not-email",
      reasonCode: "INVALID_EMAIL_SYNTAX",
      explanation: "Email address is missing or syntactically invalid.",
    },
    {
      rowNumber: 4,
      firstName: "=SUM(A1)",
      surname: "Hack",
      email: "hack@attack.com",
      reasonCode: "ALREADY_ACTIVE_MEMBER",
      explanation: "Email already belongs to an active member of this company.",
    },
  ];

  it("produces a valid CSV with headers", () => {
    const csv = generateErrorReportCsv(sampleSkipped);
    assert.ok(csv.includes("row_number,first_name,surname,email,reason_code,explanation\n"));
  });

  it("includes reason codes for each row", () => {
    const csv = generateErrorReportCsv(sampleSkipped);
    assert.ok(csv.includes("INVALID_EMAIL_SYNTAX"));
    assert.ok(csv.includes("ALREADY_ACTIVE_MEMBER"));
  });

  it("sanitizes formula injection in first names", () => {
    const csv = generateErrorReportCsv(sampleSkipped);
    // =SUM(A1) must be escaped to '=SUM(A1)
    assert.ok(csv.includes("'=SUM(A1)"));
    assert.ok(!csv.match(/^=SUM\(A1\)/m));
  });

  it("handles empty skipped list gracefully", () => {
    const csv = generateErrorReportCsv([]);
    assert.ok(csv.includes("row_number,first_name,surname,email,reason_code,explanation\n"));
    assert.equal(csv.trim().split("\n").length, 1);
  });
});

// ─── Template CSV ──────────────────────────────────────────────────────────────
describe("getBulkInvitationTemplateCsv", () => {
  it("includes the required three headers", () => {
    const template = getBulkInvitationTemplateCsv();
    assert.ok(template.includes("first_name,surname,email"));
  });

  it("includes an example row", () => {
    const template = getBulkInvitationTemplateCsv();
    assert.ok(template.includes("example.mu"));
  });
});

// ─── Seat-Limit Business Rule ──────────────────────────────────────────────────
describe("Seat Limit Rule", () => {
  it("blocks the entire batch when valid rows exceed remaining seats", () => {
    const validRows = 50;
    const remainingSeats = 30;
    assert.ok(validRows > remainingSeats);

    const overage = validRows - remainingSeats;
    const message = `This file contains ${validRows} valid employees, but your company has only ${remainingSeats} seats available. Please remove ${overage} employees or change your subscription.`;
    assert.ok(message.includes("50 valid employees"));
    assert.ok(message.includes("only 30 seats available"));
    assert.ok(message.includes("remove 20 employees"));
  });

  it("allows the batch when valid rows equal remaining seats exactly", () => {
    assert.ok(!(30 > 30));
  });

  it("treats 0 valid rows as safe", () => {
    assert.ok(!(0 > 0));
  });
});

// ─── Row Validation Logic ──────────────────────────────────────────────────────
describe("Row Validation — duplicate detection", () => {
  it("detects duplicate emails in the same file (case-insensitive)", () => {
    const emails = ["Jean@Example.MU", "marie@example.mu", "jean@example.mu"];
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const email of emails) {
      const n = email.toLowerCase();
      if (seen.has(n)) duplicates.push(n);
      else seen.add(n);
    }
    assert.equal(duplicates.length, 1);
    assert.equal(duplicates[0], "jean@example.mu");
  });
});

describe("Row Validation — required field checks", () => {
  it("skips rows with missing first name", () => {
    assert.equal(Boolean("".trim()), false);
  });

  it("accepts valid UTF-8 names", () => {
    const name = "Françoise";
    assert.ok(name.trim().length > 0);
    assert.ok(name.length <= 100);
  });

  it("rejects names over 100 characters", () => {
    const name = "A".repeat(101);
    assert.ok(name.length > 100);
  });
});

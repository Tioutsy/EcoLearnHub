import {
  db,
  companiesTable,
  employeesTable,
  employeeInvitationsTable,
  bulkInvitationBatchesTable,
  invitationEmailQueueTable,
  companySubscriptionsTable,
  employeeBandsTable,
  companyPilotPassesTable,
  type BulkInvitationBatch,
} from "@workspace/db";
import { eq, and, sql, gt, inArray } from "drizzle-orm";
import { HttpError } from "./access";
import { getBandMaxSeats } from "./seatEnforcementService";
import {
  generateSecureToken,
  generateDisplayCode,
} from "./invitationService";
import { encryptToken } from "./tokenEncryption";
import { logAuditEvent } from "./auditLogService";
import { logger } from "./logger";

export interface ParsedCsvRow {
  rowNumber: number;
  firstName: string;
  surname: string;
  email: string;
}

export interface SkippedRowReport {
  rowNumber: number;
  firstName: string;
  surname: string;
  email: string;
  reasonCode: string;
  explanation: string;
}

export interface BulkValidationResult {
  totalRows: number;
  validRows: ParsedCsvRow[];
  skippedRows: SkippedRowReport[];
  duplicateCount: number;
  existingMemberCount: number;
  existingInviteCount: number;
}

export interface ProcessBulkInvitationsInput {
  companyId: number;
  adminUserId: string;
  fileName: string;
  csvContent: string;
  originBaseUrl?: string;
}

export interface BulkBatchResult {
  batchId: number;
  companyId: number;
  fileName: string;
  totalRows: number;
  validRows: number;
  skippedRows: number;
  queuedCount: number;
  status: string;
  skippedReport: SkippedRowReport[];
  createdAt: Date;
}

/**
 * Escapes values for safe CSV export to prevent spreadsheet formula injection.
 * Prepends a single quote if the field starts with =, +, -, @, tab or return.
 */
export function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  let str = String(value).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates official downloadable UTF-8 CSV template.
 */
export function getBulkInvitationTemplateCsv(): string {
  return "first_name,surname,email\nJean,Dupont,jean.dupont@example.mu\n";
}

/**
 * Validates syntax of email address.
 */
export function isValidEmailSyntax(email: string): boolean {
  if (!email || email.length > 254) return false;
  // Standard RFC 5322 compatible regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(email);
}

/**
 * Parses raw CSV string into row objects with robust delimiter, quote, and UTF-8 handling.
 */
export function parseCsvRows(csvContent: string): { headers: string[]; rows: string[][] } {
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped double-quote: keep both in raw line for parseLine to handle
        currentLine += '""';
        i++; // skip second quote
      } else {
        inQuotes = !inQuotes;
        currentLine += char; // preserve quote in raw line for parseLine
      }
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      if (currentLine.trim().length > 0) {
        lines.push(currentLine);
      }
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim().length > 0) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cell = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const next = line[i + 1];
      if (c === '"') {
        if (inQ && next === '"') {
          // Escaped double quote — include one literal quote char
          cell += '"';
          i++;
        } else {
          // Toggle quote mode — do not include the quote char itself
          inQ = !inQ;
        }
      } else if (c === "," && !inQ) {
        // Field delimiter — push current cell, reset
        cells.push(inQ ? cell : cell.trim());
        cell = "";
      } else {
        cell += c;
      }
    }
    cells.push(inQ ? cell : cell.trim());
    return cells;
  };

  const headerCells = parseLine(lines[0]);
  const dataRows = lines.slice(1).map(parseLine);

  return { headers: headerCells, rows: dataRows };
}

/**
 * Validates CSV structure and business rules for every row.
 */
export async function validateBulkInvitationCsv(
  companyId: number,
  csvContent: string,
  tx: any = db
): Promise<BulkValidationResult> {
  if (csvContent && csvContent.length > 5 * 1024 * 1024) {
    throw new HttpError(400, "File exceeds maximum supported upload size of 5MB.");
  }

  const { headers, rows } = parseCsvRows(csvContent);

  if (rows.length === 0 && headers.length === 0) {
    throw new HttpError(400, "The uploaded CSV file is empty.");
  }

  // Header matching (case-insensitive & whitespace-trimmed)
  const normHeaders = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, ""));
  const firstNameIdx = normHeaders.findIndex(
    (h) => h === "first_name" || h === "firstname" || h === "first"
  );
  const surnameIdx = normHeaders.findIndex(
    (h) => h === "surname" || h === "last_name" || h === "lastname" || h === "last"
  );
  const emailIdx = normHeaders.findIndex(
    (h) => h === "email" || h === "email_address" || h === "emailaddress"
  );

  if (emailIdx === -1) {
    throw new HttpError(
      400,
      "Invalid CSV format: Missing required 'email' column header. Expected headers: first_name,surname,email"
    );
  }
  if (firstNameIdx === -1) {
    throw new HttpError(
      400,
      "Invalid CSV format: Missing required 'first_name' column header. Expected headers: first_name,surname,email"
    );
  }
  if (surnameIdx === -1) {
    throw new HttpError(
      400,
      "Invalid CSV format: Missing required 'surname' column header. Expected headers: first_name,surname,email"
    );
  }

  if (rows.length > 2500) {
    throw new HttpError(
      400,
      `File exceeds maximum supported batch size. A maximum of 2500 rows can be uploaded in one batch (found ${rows.length} rows).`
    );
  }

  // Pre-load company members and active pending invitations for fast in-memory validation
  const existingEmployees = await tx
    .select({ email: sql<string>`lower(${employeesTable.email})`, companyId: employeesTable.companyId, status: employeesTable.status })
    .from(employeesTable);

  const companyEmployeeEmails = new Set<string>();
  const otherCompanyActiveEmails = new Set<string>();

  for (const emp of existingEmployees) {
    if (emp.companyId === companyId) {
      if (emp.status === "active") companyEmployeeEmails.add(emp.email);
    } else {
      if (emp.status === "active") otherCompanyActiveEmails.add(emp.email);
    }
  }

  const now = new Date();
  const existingInvites = await tx
    .select({ email: sql<string>`lower(${employeeInvitationsTable.email})` })
    .from(employeeInvitationsTable)
    .where(
      and(
        eq(employeeInvitationsTable.companyId, companyId),
        eq(employeeInvitationsTable.status, "pending"),
        gt(employeeInvitationsTable.expiresAt, now)
      )
    );

  const companyPendingInviteEmails = new Set<string>(existingInvites.map((i: any) => i.email));

  const seenInFileEmails = new Set<string>();
  const validRows: ParsedCsvRow[] = [];
  const skippedRows: SkippedRowReport[] = [];
  let duplicateCount = 0;
  let existingMemberCount = 0;
  let existingInviteCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2; // 1-indexed including header
    const cells = rows[i];

    const rawFirstName = (cells[firstNameIdx] ?? "").trim();
    const rawSurname = (cells[surnameIdx] ?? "").trim();
    const rawEmail = (cells[emailIdx] ?? "").trim();

    // 1. Missing first name
    if (!rawFirstName) {
      skippedRows.push({
        rowNumber,
        firstName: "",
        surname: rawSurname,
        email: rawEmail,
        reasonCode: "MISSING_FIRST_NAME",
        explanation: "First name is required.",
      });
      continue;
    }

    if (rawFirstName.length > 100) {
      skippedRows.push({
        rowNumber,
        firstName: rawFirstName.slice(0, 100),
        surname: rawSurname,
        email: rawEmail,
        reasonCode: "FIRST_NAME_TOO_LONG",
        explanation: "First name exceeds maximum length limit (100 characters).",
      });
      continue;
    }

    // 2. Missing surname
    if (!rawSurname) {
      skippedRows.push({
        rowNumber,
        firstName: rawFirstName,
        surname: "",
        email: rawEmail,
        reasonCode: "MISSING_SURNAME",
        explanation: "Surname is required.",
      });
      continue;
    }

    if (rawSurname.length > 100) {
      skippedRows.push({
        rowNumber,
        firstName: rawFirstName,
        surname: rawSurname.slice(0, 100),
        email: rawEmail,
        reasonCode: "SURNAME_TOO_LONG",
        explanation: "Surname exceeds maximum length limit (100 characters).",
      });
      continue;
    }

    // 3. Email validation
    const normalizedEmail = rawEmail.toLowerCase();
    if (!normalizedEmail || !isValidEmailSyntax(normalizedEmail)) {
      skippedRows.push({
        rowNumber,
        firstName: rawFirstName,
        surname: rawSurname,
        email: rawEmail,
        reasonCode: "INVALID_EMAIL_SYNTAX",
        explanation: "Email address is missing or syntactically invalid.",
      });
      continue;
    }

    // 4. Duplicate within same CSV file
    if (seenInFileEmails.has(normalizedEmail)) {
      duplicateCount++;
      skippedRows.push({
        rowNumber,
        firstName: rawFirstName,
        surname: rawSurname,
        email: normalizedEmail,
        reasonCode: "DUPLICATE_IN_FILE",
        explanation: "Duplicate email address found in the same uploaded CSV file.",
      });
      continue;
    }
    seenInFileEmails.add(normalizedEmail);

    // 5. Already active employee in this company
    if (companyEmployeeEmails.has(normalizedEmail)) {
      existingMemberCount++;
      skippedRows.push({
        rowNumber,
        firstName: rawFirstName,
        surname: rawSurname,
        email: normalizedEmail,
        reasonCode: "ALREADY_ACTIVE_MEMBER",
        explanation: "Email already belongs to an active member of this company.",
      });
      continue;
    }

    // 6. Active pending invitation already exists for this company
    if (companyPendingInviteEmails.has(normalizedEmail)) {
      existingInviteCount++;
      skippedRows.push({
        rowNumber,
        firstName: rawFirstName,
        surname: rawSurname,
        email: normalizedEmail,
        reasonCode: "PENDING_INVITATION_EXISTS",
        explanation: "An active pending invitation already exists for this email address.",
      });
      continue;
    }

    // 7. Cross-company membership conflict (safe report without leaking external tenant info)
    if (otherCompanyActiveEmails.has(normalizedEmail)) {
      skippedRows.push({
        rowNumber,
        firstName: rawFirstName,
        surname: rawSurname,
        email: normalizedEmail,
        reasonCode: "CROSS_COMPANY_CONFLICT",
        explanation: "Account cannot be invited due to an existing organisation conflict.",
      });
      continue;
    }

    validRows.push({
      rowNumber,
      firstName: rawFirstName,
      surname: rawSurname,
      email: normalizedEmail,
    });
  }

  return {
    totalRows: rows.length,
    validRows,
    skippedRows,
    duplicateCount,
    existingMemberCount,
    existingInviteCount,
  };
}

/**
 * Process uploaded bulk invitations atomically inside a PostgreSQL row-locked transaction.
 */
export async function processBulkInvitations(
  input: ProcessBulkInvitationsInput
): Promise<BulkBatchResult> {
  const { companyId, adminUserId, fileName, csvContent } = input;

  return await db.transaction(async (tx) => {
    // 1. Acquire row-level lock on companies table to prevent concurrent capacity races
    await tx.execute(
      sql`SELECT id, max_employees FROM companies WHERE id = ${companyId} FOR UPDATE`
    );

    const [company] = await tx
      .select({ id: companiesTable.id, name: companiesTable.name, maxEmployees: companiesTable.maxEmployees })
      .from(companiesTable)
      .where(eq(companiesTable.id, companyId))
      .limit(1);

    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    // 2. Authoritative Subscription & Seat Allowance Calculation
    const [sub] = await tx
      .select({
        status: companySubscriptionsTable.status,
        bandCode: employeeBandsTable.code,
        bandMax: employeeBandsTable.maximumEmployees,
      })
      .from(companySubscriptionsTable)
      .leftJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
      .where(eq(companySubscriptionsTable.companyId, companyId))
      .limit(1);

    const [pilotPass] = await tx
      .select()
      .from(companyPilotPassesTable)
      .where(eq(companyPilotPassesTable.companyId, companyId))
      .limit(1);

    const now = new Date();
    let isPilotActive = false;
    if (pilotPass && pilotPass.status !== "converted") {
      const isExpired = pilotPass.status === "expired" || (pilotPass.expiresAt && now.getTime() > new Date(pilotPass.expiresAt).getTime());
      const isRevoked = pilotPass.status === "revoked";
      if (!isExpired && !isRevoked) {
        isPilotActive = true;
      }
    }

    const isSubscriptionActive = sub?.status === "ACTIVE" || isPilotActive;

    if (!isSubscriptionActive) {
      throw new HttpError(
        402,
        JSON.stringify({
          code: "SUBSCRIPTION_INACTIVE",
          message: "An active paid subscription or pilot pass is required to issue bulk employee invitations.",
        })
      );
    }

    let maxSeats = getBandMaxSeats(sub?.bandCode ?? null, company.maxEmployees ?? sub?.bandMax);
    if (isPilotActive && pilotPass) {
      maxSeats = pilotPass.learnerSeatLimit + pilotPass.administratorSeatLimit;
    }

    // Current active employees
    const [activeRes] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(employeesTable)
      .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));
    const activeCount = activeRes?.count ?? 0;

    // Current valid pending invitations
    const [pendingRes] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(employeeInvitationsTable)
      .where(
        and(
          eq(employeeInvitationsTable.companyId, companyId),
          eq(employeeInvitationsTable.status, "pending"),
          sql`${employeeInvitationsTable.expiresAt} > ${now}`
        )
      );
    const pendingCount = pendingRes?.count ?? 0;

    const reservedSeats = activeCount + pendingCount;
    const remainingSeats = Math.max(0, maxSeats - reservedSeats);

    // 3. Validate every row in the CSV
    const validation = await validateBulkInvitationCsv(companyId, csvContent, tx);
    const validCount = validation.validRows.length;

    // 4. Strict Seat-Limit Enforcement
    if (validCount > remainingSeats) {
      // Pause/reject entire batch, create 0 invitations, send 0 emails
      const overage = validCount - remainingSeats;
      const message = `This file contains ${validCount} valid employees, but your company has only ${remainingSeats} seats available. Please remove ${overage} employees or change your subscription.`;
      
      throw new HttpError(
        403,
        JSON.stringify({
          code: "SEAT_LIMIT_EXCEEDED",
          message,
          validEmployees: validCount,
          availableSeats: remainingSeats,
          overage,
        })
      );
    }

    // 5. Create Bulk Batch Record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [batch] = await tx
      .insert(bulkInvitationBatchesTable)
      .values({
        companyId,
        uploadedByUserId: adminUserId,
        fileName,
        totalRows: validation.totalRows,
        validRows: validCount,
        skippedRows: validation.skippedRows.length,
        queuedCount: validCount,
        sentCount: 0,
        failedCount: 0,
        status: validCount > 0 ? "processing" : "completed",
        errorReportJson: JSON.stringify(validation.skippedRows),
      })
      .returning();

    // 6. Create Individual Invitations & Email Queue Jobs Transactionally
    for (const row of validation.validRows) {
      const { rawToken, tokenHash } = generateSecureToken();
      const { displayCodeHash, displayCodeLastFour } = generateDisplayCode();
      const encryptedRawToken = encryptToken(rawToken);

      const [invitation] = await tx
        .insert(employeeInvitationsTable)
        .values({
          companyId,
          batchId: batch.id,
          email: row.email,
          firstName: row.firstName,
          lastName: row.surname,
          intendedRole: "employee",
          tokenHash,
          displayCodeHash,
          displayCodeLastFour,
          status: "pending",
          invitedBy: adminUserId,
          expiresAt,
        })
        .returning();

      // Create durable Outbox queue entry with encrypted token
      await tx.insert(invitationEmailQueueTable).values({
        batchId: batch.id,
        companyId,
        invitationId: invitation.id,
        recipientEmail: row.email,
        recipientName: `${row.firstName} ${row.surname}`.trim(),
        encryptedRawToken,
        status: "queued",
        nextAttemptAt: new Date(),
      });
    }

    // 7. Audit Log Entry (contains NO plaintext codes)
    await logAuditEvent({
      companyId,
      actorUserId: adminUserId,
      actorRole: "company_admin",
      action: "invitations.bulk_uploaded",
      targetType: "bulk_invitation_batch",
      targetId: batch.id,
      metadata: {
        fileName,
        totalRows: validation.totalRows,
        validRows: validCount,
        skippedRows: validation.skippedRows.length,
      },
    });

    return {
      batchId: batch.id,
      companyId: batch.companyId,
      fileName: batch.fileName,
      totalRows: batch.totalRows,
      validRows: batch.validRows,
      skippedRows: batch.skippedRows,
      queuedCount: batch.queuedCount,
      status: batch.status,
      skippedReport: validation.skippedRows,
      createdAt: batch.createdAt,
    };
  });
}

/**
 * Generates sanitized CSV error report for skipped rows.
 */
export function generateErrorReportCsv(skippedRows: SkippedRowReport[]): string {
  const headers = "row_number,first_name,surname,email,reason_code,explanation\n";
  const rows = skippedRows.map((r) => {
    return [
      escapeCsvField(r.rowNumber),
      escapeCsvField(r.firstName),
      escapeCsvField(r.surname),
      escapeCsvField(r.email),
      escapeCsvField(r.reasonCode),
      escapeCsvField(r.explanation),
    ].join(",");
  });

  return headers + rows.join("\n") + "\n";
}

/**
 * Retrieves authoritative batch status and statistics.
 */
export async function getBulkBatchStatus(
  companyId: number,
  batchId: number
): Promise<(BulkInvitationBatch & { acceptedCount: number; revokedCount: number; skippedReport: SkippedRowReport[] }) | null> {
  const [batch] = await db
    .select()
    .from(bulkInvitationBatchesTable)
    .where(
      and(
        eq(bulkInvitationBatchesTable.id, batchId),
        eq(bulkInvitationBatchesTable.companyId, companyId)
      )
    )
    .limit(1);

  if (!batch) return null;

  const [counts] = await db
    .select({
      acceptedCount: sql<number>`count(*) FILTER (WHERE ${employeeInvitationsTable.status} = 'accepted')::int`,
      revokedCount: sql<number>`count(*) FILTER (WHERE ${employeeInvitationsTable.status} = 'revoked')::int`,
    })
    .from(employeeInvitationsTable)
    .where(
      and(
        eq(employeeInvitationsTable.batchId, batchId),
        eq(employeeInvitationsTable.companyId, companyId)
      )
    );

  let skippedReport: SkippedRowReport[] = [];
  if (batch.errorReportJson) {
    try {
      skippedReport = JSON.parse(batch.errorReportJson);
    } catch {
      skippedReport = [];
    }
  }

  return {
    ...batch,
    acceptedCount: counts?.acceptedCount ?? 0,
    revokedCount: counts?.revokedCount ?? 0,
    skippedReport,
  };
}

import { randomUUID } from "crypto";
import { db, employeesTable, companiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getCompanyOnboardingStatus } from "./companyOnboardingService";

export interface ValidatedImportRow {
  rowNumber: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: "employee" | "manager" | "admin";
  department: string | null;
  jobTitle: string | null;
}

export interface InvalidImportRow {
  rowNumber: number;
  name: string;
  email: string;
  error: string;
}

export interface CsvImportValidationResult {
  totalRows: number;
  validRows: ValidatedImportRow[];
  invalidRows: InvalidImportRow[];
  capacityLimitExceeded: boolean;
  currentEmployeeCount: number;
  maxAllowedEmployees: number;
  remainingCapacity: number;
}

function sanitizeText(val: string): string {
  let text = val.trim();
  if (text.startsWith("=") || text.startsWith("+") || text.startsWith("-") || text.startsWith("@")) {
    text = "'" + text;
  }
  return text;
}

export function parseAndValidateEmployeeCsv(
  csvContent: string,
  currentEmployees: { email: string }[],
  remainingCapacity: number
): CsvImportValidationResult {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      totalRows: 0,
      validRows: [],
      invalidRows: [{ rowNumber: 0, name: "", email: "", error: "CSV file is empty" }],
      capacityLimitExceeded: false,
      currentEmployeeCount: currentEmployees.length,
      maxAllowedEmployees: currentEmployees.length + remainingCapacity,
      remainingCapacity,
    };
  }

  // Parse headers
  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  const emailIdx = headers.findIndex((h) => h === "email" || h === "email_address");
  const firstNameIdx = headers.findIndex((h) => h === "first_name" || h === "firstname");
  const lastNameIdx = headers.findIndex((h) => h === "last_name" || h === "lastname");
  const nameIdx = headers.findIndex((h) => h === "name" || h === "full_name");
  const roleIdx = headers.findIndex((h) => h === "role");
  const deptIdx = headers.findIndex((h) => h === "department" || h === "dept");
  const titleIdx = headers.findIndex((h) => h === "job_title" || h === "jobtitle" || h === "title");

  if (emailIdx === -1) {
    return {
      totalRows: lines.length - 1,
      validRows: [],
      invalidRows: [{ rowNumber: 1, name: "", email: "", error: "Missing required 'email' column header" }],
      capacityLimitExceeded: false,
      currentEmployeeCount: currentEmployees.length,
      maxAllowedEmployees: currentEmployees.length + remainingCapacity,
      remainingCapacity,
    };
  }

  const existingEmails = new Set(currentEmployees.map((e) => e.email.toLowerCase()));
  const fileSeenEmails = new Set<string>();

  const validRows: ValidatedImportRow[] = [];
  const invalidRows: InvalidImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1;
    const rowCells = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));

    const emailRaw = rowCells[emailIdx] ?? "";
    const email = sanitizeText(emailRaw.toLowerCase());

    let firstName = firstNameIdx !== -1 ? sanitizeText(rowCells[firstNameIdx] ?? "") : "";
    let lastName = lastNameIdx !== -1 ? sanitizeText(rowCells[lastNameIdx] ?? "") : "";
    let name = nameIdx !== -1 ? sanitizeText(rowCells[nameIdx] ?? "") : "";

    if (!name && (firstName || lastName)) {
      name = `${firstName} ${lastName}`.trim();
    } else if (name && !firstName) {
      const parts = name.split(" ");
      firstName = parts[0] ?? "";
      lastName = parts.slice(1).join(" ") ?? "";
    }

    const roleRaw = roleIdx !== -1 ? rowCells[roleIdx]?.toLowerCase() : "employee";
    const dept = deptIdx !== -1 ? sanitizeText(rowCells[deptIdx] ?? "") : null;
    const title = titleIdx !== -1 ? sanitizeText(rowCells[titleIdx] ?? "") : null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      invalidRows.push({ rowNumber, name, email, error: "Invalid or missing email address" });
      continue;
    }

    if (!name) {
      invalidRows.push({ rowNumber, name: "", email, error: "Missing employee name" });
      continue;
    }

    if (existingEmails.has(email)) {
      invalidRows.push({ rowNumber, name, email, error: "Employee email already exists in company" });
      continue;
    }

    if (fileSeenEmails.has(email)) {
      invalidRows.push({ rowNumber, name, email, error: "Duplicate email within import file" });
      continue;
    }

    let role: "employee" | "manager" | "admin" = "employee";
    if (roleRaw === "manager" || roleRaw === "admin") {
      role = roleRaw;
    } else if (roleRaw === "platform_admin") {
      invalidRows.push({ rowNumber, name, email, error: "Cannot assign platform_admin role via CSV" });
      continue;
    }

    fileSeenEmails.add(email);
    validRows.push({
      rowNumber,
      firstName,
      lastName,
      name,
      email,
      role,
      department: dept || null,
      jobTitle: title || null,
    });
  }

  const capacityLimitExceeded = validRows.length > remainingCapacity;

  return {
    totalRows: lines.length - 1,
    validRows,
    invalidRows,
    capacityLimitExceeded,
    currentEmployeeCount: currentEmployees.length,
    maxAllowedEmployees: currentEmployees.length + remainingCapacity,
    remainingCapacity,
  };
}

export async function executeEmployeeImport(
  companyId: number,
  validRows: ValidatedImportRow[]
): Promise<{ importedCount: number; employees: any[] }> {
  const insertedEmployees: any[] = [];

  for (const row of validRows) {
    const token = randomUUID();
    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId,
        name: row.name,
        email: row.email,
        department: row.department,
        jobTitle: row.jobTitle,
        role: row.role,
        invitationStatus: "invited",
        invitationToken: token,
        invitationSentAt: new Date(),
      })
      .returning();

    insertedEmployees.push(emp);
  }

  // Update company employee count
  const allEmps = await db
    .select({ id: employeesTable.id })
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  await db
    .update(companiesTable)
    .set({ employeeCount: allEmps.length })
    .where(eq(companiesTable.id, companyId));

  return {
    importedCount: insertedEmployees.length,
    employees: insertedEmployees,
  };
}

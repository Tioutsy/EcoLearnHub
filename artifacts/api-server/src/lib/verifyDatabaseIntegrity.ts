import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export interface IntegrityIssue {
  type: "critical" | "warning" | "informational";
  message: string;
  details?: any;
}

export interface IntegrityReport {
  valid: boolean;
  issues: IntegrityIssue[];
}

export async function verifyDatabaseIntegrity(): Promise<IntegrityReport> {
  const issues: IntegrityIssue[] = [];

  const checkTableExists = async (table: string): Promise<boolean> => {
    const res = await db.execute(sql.raw(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = '${table}'
    `));
    return res.rows.length > 0;
  };

  const checkColumnExists = async (table: string, column: string): Promise<boolean> => {
    const res = await db.execute(sql.raw(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = '${column}'
    `));
    return res.rows.length > 0;
  };

  const getConstraints = async (table: string): Promise<{ name: string; type: string; definition: string }[]> => {
    try {
      const res = await db.execute(sql.raw(`
        SELECT 
          c.conname AS name,
          c.contype AS type,
          pg_get_constraintdef(c.oid) AS definition
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = '${table}'
      `));
      return res.rows.map((r: any) => ({
        name: r.name,
        type: r.type,
        definition: r.definition
      }));
    } catch {
      return [];
    }
  };

  // 1. Verify Expected Tables
  const requiredTables = ["learning_paths", "challenges", "challenge_participants", "badge_definitions", "employee_badges"];
  for (const table of requiredTables) {
    const exists = await checkTableExists(table);
    if (!exists) {
      issues.push({
        type: "critical",
        message: `Required table '${table}' is missing.`
      });
    }
  }

  // If critical tables are missing, stop further checks
  if (issues.some(i => i.type === "critical")) {
    return { valid: false, issues };
  }

  // 2. Verify Expected Columns
  const requiredColumns: { [key: string]: string[] } = {
    learning_paths: ["company_id"],
    challenges: ["linked_course_id", "code"],
    challenge_participants: ["company_id", "status", "points_awarded"],
    badge_definitions: ["code"],
    employee_badges: ["employee_id", "company_id", "badge_id"]
  };

  for (const [table, cols] of Object.entries(requiredColumns)) {
    for (const col of cols) {
      const exists = await checkColumnExists(table, col);
      if (!exists) {
        issues.push({
          type: "critical",
          message: `Required column '${col}' in table '${table}' is missing.`
        });
      }
    }
  }

  if (issues.some(i => i.type === "critical")) {
    return { valid: false, issues };
  }

  // 3. Verify Expected Constraints (Equivalent checks)
  // helper to search matching constraint definition
  const verifyConstraint = (
    tableConstraints: { name: string; type: string; definition: string }[],
    expectedName: string,
    type: string,
    pattern: string,
    tableName: string
  ) => {
    // try direct name first
    const exact = tableConstraints.find(c => c.name === expectedName);
    if (exact) {
      if (exact.type !== type || !exact.definition.toLowerCase().includes(pattern.toLowerCase())) {
        issues.push({
          type: "critical",
          message: `Constraint '${expectedName}' on table '${tableName}' exists but has incorrect definition. Expected pattern: ${pattern}`
        });
      }
      return;
    }

    // try equivalent search by definition pattern
    const equiv = tableConstraints.find(c => c.type === type && c.definition.toLowerCase().includes(pattern.toLowerCase()));
    if (equiv) {
      issues.push({
        type: "informational",
        message: `Equivalent constraint for '${expectedName}' exists under another name '${equiv.name}' on table '${tableName}'.`
      });
    } else {
      issues.push({
        type: "critical",
        message: `Constraint '${expectedName}' (or equivalent matching pattern: ${pattern}) on table '${tableName}' is missing.`
      });
    }
  };

  // Learning Paths FK
  const lpCons = await getConstraints("learning_paths");
  verifyConstraint(lpCons, "learning_paths_company_id_fk", "f", "FOREIGN KEY (company_id) REFERENCES companies(id)", "learning_paths");

  // Challenges FK & Unique Code
  const chCons = await getConstraints("challenges");
  verifyConstraint(chCons, "challenges_linked_course_id_fk", "f", "FOREIGN KEY (linked_course_id) REFERENCES courses(id)", "challenges");
  verifyConstraint(chCons, "challenges_code_key", "u", "UNIQUE (code)", "challenges");

  // Challenge Participants FKs & Unique & Check Constraints
  const cpCons = await getConstraints("challenge_participants");
  verifyConstraint(cpCons, "challenge_participants_company_id_fk", "f", "FOREIGN KEY (company_id) REFERENCES companies(id)", "challenge_participants");
  verifyConstraint(cpCons, "uniq_participant_company", "u", "UNIQUE (challenge_id, user_id, company_id)", "challenge_participants");
  verifyConstraint(cpCons, "chk_status", "c", "status = ANY (ARRAY", "challenge_participants");
  verifyConstraint(cpCons, "chk_points_awarded", "c", "points_awarded = ANY (ARRAY", "challenge_participants");

  // Badge Definitions Unique Code
  const bdCons = await getConstraints("badge_definitions");
  verifyConstraint(bdCons, "badge_definitions_code_key", "u", "UNIQUE (code)", "badge_definitions");

  // Employee Badges FKs & Unique
  const ebCons = await getConstraints("employee_badges");
  verifyConstraint(ebCons, "employee_badges_employee_id_fk", "f", "FOREIGN KEY (employee_id) REFERENCES employees(id)", "employee_badges");
  verifyConstraint(ebCons, "employee_badges_company_id_fk", "f", "FOREIGN KEY (company_id) REFERENCES companies(id)", "employee_badges");
  verifyConstraint(ebCons, "employee_badges_badge_id_fk", "f", "FOREIGN KEY (badge_id) REFERENCES badge_definitions(id)", "employee_badges");
  verifyConstraint(ebCons, "uniq_employee_badge", "u", "UNIQUE (employee_id, badge_id)", "employee_badges");

  // 4. Data Invariants (Orphans, Duplicates, Check Violations)
  // Duplicates on challenges
  const chDups = await db.execute(sql`
    SELECT code FROM challenges WHERE code IS NOT NULL GROUP BY code HAVING count(*) > 1
  `);
  if (chDups.rows.length > 0) {
    issues.push({
      type: "critical",
      message: "Duplicate challenge codes found in database.",
      details: chDups.rows
    });
  }

  // Duplicates on badge_definitions
  const bdDups = await db.execute(sql`
    SELECT code FROM badge_definitions WHERE code IS NOT NULL GROUP BY code HAVING count(*) > 1
  `);
  if (bdDups.rows.length > 0) {
    issues.push({
      type: "critical",
      message: "Duplicate badge definition codes found in database.",
      details: bdDups.rows
    });
  }

  // Duplicates on challenge_participants
  const cpDups = await db.execute(sql`
    SELECT challenge_id, user_id, company_id FROM challenge_participants 
    GROUP BY challenge_id, user_id, company_id HAVING count(*) > 1
  `);
  if (cpDups.rows.length > 0) {
    issues.push({
      type: "critical",
      message: "Duplicate challenge participant assignments found in database.",
      details: cpDups.rows
    });
  }

  // Duplicates on employee_badges
  const ebDups = await db.execute(sql`
    SELECT employee_id, badge_id FROM employee_badges 
    GROUP BY employee_id, badge_id HAVING count(*) > 1
  `);
  if (ebDups.rows.length > 0) {
    issues.push({
      type: "critical",
      message: "Duplicate employee badge awards found in database.",
      details: ebDups.rows
    });
  }

  // Orphans learning_paths
  const lpOrphans = await db.execute(sql`
    SELECT id FROM learning_paths 
    WHERE company_id IS NOT NULL AND company_id NOT IN (SELECT id FROM companies)
  `);
  if (lpOrphans.rows.length > 0) {
    issues.push({
      type: "critical",
      message: "Orphaned company references in learning_paths.",
      details: lpOrphans.rows
    });
  }

  // Orphans challenges
  const chOrphans = await db.execute(sql`
    SELECT id FROM challenges 
    WHERE linked_course_id IS NOT NULL AND linked_course_id NOT IN (SELECT id FROM courses)
  `);
  if (chOrphans.rows.length > 0) {
    issues.push({
      type: "critical",
      message: "Orphaned course references in challenges.",
      details: chOrphans.rows
    });
  }

  // Orphans challenge_participants
  const cpOrphans = await db.execute(sql`
    SELECT id FROM challenge_participants 
    WHERE company_id IS NOT NULL AND company_id NOT IN (SELECT id FROM companies)
  `);
  if (cpOrphans.rows.length > 0) {
    issues.push({
      type: "critical",
      message: "Orphaned company references in challenge_participants.",
      details: cpOrphans.rows
    });
  }

  // Orphans employee_badges
  const ebEmpOrphans = await db.execute(sql`
    SELECT id FROM employee_badges WHERE employee_id NOT IN (SELECT id FROM employees)
  `);
  const ebCompOrphans = await db.execute(sql`
    SELECT id FROM employee_badges WHERE company_id NOT IN (SELECT id FROM companies)
  `);
  const ebBadgeOrphans = await db.execute(sql`
    SELECT id FROM employee_badges WHERE badge_id NOT IN (SELECT id FROM badge_definitions)
  `);

  if (ebEmpOrphans.rows.length > 0 || ebCompOrphans.rows.length > 0 || ebBadgeOrphans.rows.length > 0) {
    issues.push({
      type: "critical",
      message: "Orphaned employee, company, or badge references in employee_badges.",
      details: {
        orphanedEmployees: ebEmpOrphans.rows,
        orphanedCompanies: ebCompOrphans.rows,
        orphanedBadges: ebBadgeOrphans.rows
      }
    });
  }

  // Invalid challenge status check
  const cpInvalidStatus = await db.execute(sql`
    SELECT id, status FROM challenge_participants 
    WHERE status NOT IN ('in_progress', 'submitted', 'approved', 'rejected')
  `);
  if (cpInvalidStatus.rows.length > 0) {
    issues.push({
      type: "critical",
      message: "Invalid status values in challenge_participants.",
      details: cpInvalidStatus.rows
    });
  }

  // Invalid points awarded check
  const cpInvalidPoints = await db.execute(sql`
    SELECT id, points_awarded FROM challenge_participants 
    WHERE points_awarded NOT IN (0, 10)
  `);
  if (cpInvalidPoints.rows.length > 0) {
    issues.push({
      type: "critical",
      message: "Invalid points_awarded values in challenge_participants.",
      details: cpInvalidPoints.rows
    });
  }

  // Employee Badge Company mismatch
  const ebCompanyMismatch = await db.execute(sql`
    SELECT eb.id FROM employee_badges eb 
    JOIN employees e ON e.id = eb.employee_id 
    WHERE eb.company_id <> e.company_id
  `);
  if (ebCompanyMismatch.rows.length > 0) {
    issues.push({
      type: "critical",
      message: "employee_badges has records where company_id does not match the employee's company_id.",
      details: ebCompanyMismatch.rows
    });
  }

  const isValid = !issues.some(i => i.type === "critical");
  logger.info({ valid: isValid, issueCount: issues.length }, "Database integrity checks completed");

  return {
    valid: isValid,
    issues
  };
}

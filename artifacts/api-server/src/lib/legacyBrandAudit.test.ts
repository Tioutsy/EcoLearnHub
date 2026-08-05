import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROHIBITED_NAMES = [
  "ecolearnhub",
  "eco learn hub",
  "ecolearn",
  "verdia",
  "evolia",
  "paceo",
  "ebony forest",
];

// Documented allowable matches for internal technical compat / test fixtures / historic data
const ALLOWED_MATCHES = [
  "recyclean_customer_ref",
  "0007_learning_path_updates.sql",
  "0012_wide_captain_stacy.sql",
  "0012_snapshot.json",
  "seed-foundations.mjs",
  "legacyBrandAudit.test.ts",
  ".test.ts",
  "_e2e.ts",
  "verify_",
  "serviceType:",
  "repairProductionSchema.ts",
];

function isAllowed(filePath: string, line: string): boolean {
  return ALLOWED_MATCHES.some(
    (allowed) => filePath.includes(allowed) || line.includes(allowed)
  );
}

function scanDirectory(
  dir: string,
  fileList: string[] = [],
  extensions = [".ts", ".tsx", ".js", ".jsx", ".json", ".html"]
): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.startsWith(".") || file === "node_modules" || file === "dist" || file === "docs") continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath, fileList, extensions);
    } else if (extensions.includes(path.extname(fullPath))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe("Legacy Brand Audit (Elevio Rebrand Verification)", () => {
  test("Active source files do not contain prohibited legacy brand names", () => {
    const rootDir = path.resolve(__dirname, "../../../..");
    const dirsToScan = [
      path.join(rootDir, "artifacts/ecolearn/src"),
      path.join(rootDir, "artifacts/api-server/src"),
      path.join(rootDir, "lib/db/src"),
    ];

    const violations: { file: string; line: number; term: string; content: string }[] = [];

    for (const scanDir of dirsToScan) {
      if (!fs.existsSync(scanDir)) continue;
      const files = scanDirectory(scanDir);
      for (const file of files) {
        const content = fs.readFileSync(file, "utf8");
        const lines = content.split("\n");
        lines.forEach((line, index) => {
          const lower = line.toLowerCase();
          for (const term of PROHIBITED_NAMES) {
            if (lower.includes(term)) {
              if (!isAllowed(file, line)) {
                violations.push({
                  file: path.relative(rootDir, file),
                  line: index + 1,
                  term,
                  content: line.trim(),
                });
              }
            }
          }
        });
      }
    }

    if (violations.length > 0) {
      const report = violations
        .map((v) => `${v.file}:${v.line} -> matched '${v.term}': "${v.content}"`)
        .join("\n");
      assert.fail(`Found ${violations.length} prohibited legacy brand references:\n${report}`);
    }
  });
});

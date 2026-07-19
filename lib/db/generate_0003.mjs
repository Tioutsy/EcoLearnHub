import fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputSql = fs.readFileSync(path.join(__dirname, '../../drizzle/0000_puzzling_captain_america.sql'), 'utf8');

let outputSql = '';

// Split by statement breakpoints
const statements = inputSql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);

for (const stmt of statements) {
  if (stmt.startsWith('CREATE TABLE')) {
    outputSql += stmt.replace(/^CREATE TABLE "([^"]+)"/, 'CREATE TABLE IF NOT EXISTS "$1"') + ';\n--> statement-breakpoint\n';
  } else if (stmt.startsWith('CREATE INDEX')) {
    outputSql += stmt.replace(/^CREATE INDEX "([^"]+)"/, 'CREATE INDEX IF NOT EXISTS "$1"') + ';\n--> statement-breakpoint\n';
  } else if (stmt.startsWith('ALTER TABLE')) {
    // ALTER TABLE "x" ADD CONSTRAINT "y" FOREIGN KEY ...
    const match = stmt.match(/^ALTER TABLE "([^"]+)" ADD CONSTRAINT "([^"]+)" (FOREIGN KEY.*)/);
    if (match) {
      const table = match[1];
      const constraint = match[2];
      const fkDef = match[3];
      
      const plpgsql = `DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${constraint}') THEN
        ALTER TABLE "${table}" ADD CONSTRAINT "${constraint}" ${fkDef}
    END IF;
END $$;`;
      outputSql += plpgsql + '\n--> statement-breakpoint\n';
    } else {
      // Unhandled ALTER TABLE (though 0000 only has FK constraints as ALTER)
      outputSql += stmt + ';\n--> statement-breakpoint\n';
    }
  } else {
    // Other statements
    outputSql += stmt + ';\n--> statement-breakpoint\n';
  }
}

// Remove trailing statement breakpoint
outputSql = outputSql.replace(/--> statement-breakpoint\n$/, '');

fs.writeFileSync(path.join(__dirname, '../../drizzle/0003_production_tables_gap.sql'), outputSql);
console.log('0003_production_tables_gap.sql generated successfully.');

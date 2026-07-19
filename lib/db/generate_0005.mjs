import fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputSql = fs.readFileSync(path.join(__dirname, '../../drizzle/0000_puzzling_captain_america.sql'), 'utf8');

let outputSql = '';

const statements = inputSql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);

for (const stmt of statements) {
  if (stmt.startsWith('CREATE TABLE')) {
    const tableMatch = stmt.match(/^CREATE TABLE "([^"]+)" \(([\s\S]+)\);$/);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const body = tableMatch[2];
      
      const lines = body.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      for (const line of lines) {
        if (line.startsWith('CONSTRAINT') || line.startsWith('PRIMARY KEY') || line.startsWith('UNIQUE') || line.startsWith('FOREIGN KEY')) {
          continue;
        }
        
        // Match column name and definition, e.g. "title" text NOT NULL,
        const colMatch = line.match(/^"([^"]+)"\s+(.+)$/);
        if (colMatch) {
          const colName = colMatch[1];
          let colDef = colMatch[2];
          
          if (colDef.endsWith(',')) {
            colDef = colDef.slice(0, -1);
          }
          
          // DO NOT output serial primary keys, they cause multiple primary key errors
          if (colDef.includes('PRIMARY KEY')) {
            continue;
          }
          
          if (colDef.includes('NOT NULL') && !colDef.includes('DEFAULT')) {
            colDef = colDef.replace('NOT NULL', '').trim();
          }
          
          outputSql += `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${colName}" ${colDef};\n--> statement-breakpoint\n`;
        }
      }
    }
  }
}

outputSql = outputSql.replace(/--> statement-breakpoint\n$/, '');
fs.writeFileSync(path.join(__dirname, '../../drizzle/0005_production_columns_gap.sql'), outputSql);
console.log('0005_production_columns_gap.sql generated successfully.');

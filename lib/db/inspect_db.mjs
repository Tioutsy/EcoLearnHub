import pg from 'pg';

import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
const envPath = path.join(__dirname, '../../artifacts/api-server/.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envFile.match(/DATABASE_URL=(.*)/);
if (dbUrlMatch) {
  process.env.DATABASE_URL = dbUrlMatch[1];
}

async function inspect() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const tablesResult = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  
  const columnsResult = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    ORDER BY table_name, column_name;
  `);

  console.log("=== TABLES ===");
  tablesResult.rows.forEach(r => console.log(r.table_name));

  console.log("\n=== SELECTED COLUMNS ===");
  const targetTables = ['courses', 'lessons', 'system_seeds', 'quiz_questions'];
  for (const table of targetTables) {
    const cols = columnsResult.rows.filter(r => r.table_name === table).map(r => r.column_name);
    console.log(`${table}: ${cols.join(', ')}`);
  }

  await client.end();
}

inspect().catch(console.error);

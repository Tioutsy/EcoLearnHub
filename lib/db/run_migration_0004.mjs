import fs from 'fs';
import pg from 'pg';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../artifacts/api-server/.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envFile.match(/DATABASE_URL=(.*)/);
process.env.DATABASE_URL = dbUrlMatch[1];

async function run() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, '../../drizzle/0004_production_columns_gap.sql'), 'utf8');
  
  const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
  
  for (const statement of statements) {
    try {
      console.log("Executing:", statement);
      await client.query(statement);
    } catch (e) {
      console.error("Error executing statement:", statement);
      console.error(e.message);
      throw e;
    }
  }
  
  console.log("MIGRATION 0004 APPLIED SUCCESSFULLY!");
  await client.end();
}
run().catch(console.error);

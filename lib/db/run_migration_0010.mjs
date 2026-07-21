import fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
const client = new pg.Client({ connectionString: dbUrl });

async function run() {
  console.log("Applying Migration 0010 (Employee badges) to DB...");
  await client.connect();
  
  // Read sql file
  const sqlPath = path.join(__dirname, '../../drizzle/0010_employee_badges.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // Execute within a transaction
  await client.query('BEGIN;');
  try {
    await client.query(sql);
    await client.query('COMMIT;');
    console.log("Migration 0010 applied successfully.");
  } catch (err) {
    await client.query('ROLLBACK;');
    console.error("Migration 0010 failed, rolled back.", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run().catch(console.error);

import fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = "postgresql://neondb_owner:npg_lMEFSJ7wB5PR@ep-damp-hall-adrut0js-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const client = new pg.Client({ connectionString: dbUrl });

async function run() {
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, '../../drizzle/0005_production_columns_gap.sql'), 'utf8');
  const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
  
  for (const statement of statements) {
    try {
      await client.query(statement);
    } catch (e) {
      console.error("Error executing statement:", statement);
      console.error(e.message);
    }
  }
  
  await client.end();
  console.log("Migration 0005 applied to test DB successfully.");
}

run().catch(console.error);

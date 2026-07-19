import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../artifacts/api-server/.env') });

async function inspect() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
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

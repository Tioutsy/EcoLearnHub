import { db, employeesTable } from "@workspace/db";

async function inspectEmployees() {
  const employees = await db.select().from(employeesTable);
  console.log(JSON.stringify(employees.map(e => ({
    id: e.id,
    name: e.name,
    email: e.email,
    role: e.role,
    companyId: e.companyId
  })), null, 2));
  process.exit(0);
}

inspectEmployees().catch(console.error);

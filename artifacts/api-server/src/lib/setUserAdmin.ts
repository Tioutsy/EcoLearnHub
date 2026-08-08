import { db, employeesTable, companiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const TARGET_EMAIL = process.env.PLATFORM_ADMIN_BOOTSTRAP_EMAIL ?? "slennon2206@gmail.com";
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

async function setAdmin() {
  console.log(`Setting administrator role for ${TARGET_EMAIL}...`);

  // 1. Update/Ensure Company record
  let [company] = await db.select().from(companiesTable).limit(1);
  if (!company) {
    [company] = await db.insert(companiesTable).values({
      name: "Elevio Enterprise",
      slug: "elevio-enterprise",
      maxEmployees: 1000,
    }).returning();
  }

  // 2. Upsert Employee in DB
  const [existingEmp] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.email, TARGET_EMAIL));

  if (existingEmp) {
    await db
      .update(employeesTable)
      .set({
        role: "admin",
        companyId: company.id,
        updatedAt: new Date(),
      })
      .where(eq(employeesTable.id, existingEmp.id));
    console.log(`Updated database employee record ID ${existingEmp.id} to role 'admin'.`);
  } else {
    const [newEmp] = await db.insert(employeesTable).values({
      companyId: company.id,
      name: "Sharon Lennon",
      email: TARGET_EMAIL,
      department: "Executive Management",
      jobTitle: "Administrator",
      role: "admin",
      status: "active",
    }).returning();
    console.log(`Created new database employee record ID ${newEmp.id} with role 'admin'.`);
  }

  // 3. Update Clerk Public Metadata via REST API
  if (CLERK_SECRET_KEY) {
    try {
      console.log("Fetching Clerk user ID for email...");
      const res = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(TARGET_EMAIL)}`, {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const users = await res.json() as Array<{ id: string }>;
        if (users && users.length > 0) {
          const userId = users[0].id;
          console.log(`Found Clerk user ID: ${userId}. Updating public_metadata...`);

          const updateRes = await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${CLERK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              public_metadata: {
                role: "company_admin",
                companyId: company.id,
              },
            }),
          });

          if (updateRes.ok) {
            console.log(`SUCCESSFULLY updated Clerk public_metadata to { role: "company_admin" } for ${TARGET_EMAIL}!`);
          } else {
            console.error("Failed to update Clerk metadata:", await updateRes.text());
          }
        } else {
          console.log(`No active Clerk user found matching ${TARGET_EMAIL}. User will receive role on next sign-in sync.`);
        }
      } else {
        console.error("Clerk API query error:", await res.text());
      }
    } catch (err) {
      console.error("Error communicating with Clerk API:", err);
    }
  }

  process.exit(0);
}

setAdmin().catch(console.error);

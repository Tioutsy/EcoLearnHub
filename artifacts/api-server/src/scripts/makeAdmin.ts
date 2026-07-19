import { createClerkClient } from "@clerk/express";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

async function main() {
  const target = process.argv[2];

  if (!target) {
    console.log("No user ID or email provided. Fetching registered users...\n");
    try {
      const usersResponse = await clerkClient.users.getUserList({
        limit: 10,
      });

      console.log("Recent Clerk Users:");
      console.log("--------------------------------------------------------------------------------");
      for (const u of usersResponse.data) {
        const email = u.emailAddresses[0]?.emailAddress || "no-email";
        const role = u.publicMetadata?.role || "no-role";
        console.log(`ID: ${u.id}`);
        console.log(`Email: ${email}`);
        console.log(`Role: ${role}`);
        console.log("--------------------------------------------------------------------------------");
      }
      console.log("\nTo set a user as platform admin, run:");
      console.log("npx tsx src/scripts/makeAdmin.ts <USER_ID>");
    } catch (e: any) {
      console.error("Failed to fetch Clerk users:", e.message || e);
    }
    return;
  }

  try {
    let userId = target;

    // Check if target is an email address
    if (target.includes("@")) {
      const searchResponse = await clerkClient.users.getUserList({
        emailAddress: [target],
        limit: 1,
      });
      const user = searchResponse.data[0];
      if (!user) {
        console.error(`Error: User with email '${target}' not found in Clerk.`);
        process.exit(1);
      }
      userId = user.id;
    }

    console.log(`Updating metadata role to 'platform_admin' for User ID: ${userId}...`);
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "platform_admin",
      },
    });

    console.log("Successfully updated role to 'platform_admin'!");
  } catch (e: any) {
    console.error("Error setting role:", e.message || e);
  }
}

main().catch(console.error);

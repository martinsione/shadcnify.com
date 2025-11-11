import { getUser, isAuthenticated } from "../utils/auth";

export async function whoamiCommand() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    console.log("❌ Not logged in\n");
    console.log("To log in, run:");
    console.log("  npx shadcnify login\n");
    process.exit(0);
  }

  const user = await getUser();

  if (!user) {
    console.log("❌ Authentication data corrupted\n");
    console.log("Please log in again:");
    console.log("  npx shadcnify login\n");
    process.exit(1);
  }

  console.log("✓ Logged in\n");
  console.log(`Name:  ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`ID:    ${user.id}\n`);

  process.exit(0);
}

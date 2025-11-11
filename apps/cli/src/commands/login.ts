import open from "open";
import { authClient } from "../api/auth-client";
import { saveAuth } from "../utils/auth";

const CLIENT_ID = "shadcnify-cli";
const BASE_URL = process.env.SHADCNIFY_API_URL || "https://shadcnify.com";

export async function loginCommand() {
  console.log("🔐 Shadcnify CLI Authentication");
  console.log(`⏳ Requesting device authorization from ${BASE_URL}...\n`);

  try {
    // Request device code
    const { data, error } = await authClient.device.code({
      client_id: CLIENT_ID,
      scope: "openid profile email",
    });

    if (error || !data) {
      console.error(
        "❌ Error:",
        error?.error_description || error?.message || "Unknown error",
      );
      if (error) {
        console.error("Error details:", JSON.stringify(error, null, 2));
      }
      process.exit(1);
    }

    const {
      device_code,
      user_code,
      verification_uri,
      verification_uri_complete,
      interval = 5,
    } = data;

    // Construct direct URL to approval page with user code
    const approvalUrl = `${verification_uri}/approve?user_code=${user_code}`;

    console.log("📱 Device Authorization Required");
    console.log(`Please visit: ${approvalUrl}`);
    console.log(`Enter code: ${user_code}\n`);

    // Open browser directly to the approval page
    console.log("🌐 Opening browser...");
    try {
      await open(approvalUrl);
    } catch (err) {
      console.log("⚠️  Could not open browser automatically");
    }

    console.log(
      `\n⏳ Waiting for authorization... (polling every ${interval}s)\n`,
    );

    // Poll for token
    await pollForToken(device_code, interval);
  } catch (err) {
    console.error(
      "❌ Error:",
      err instanceof Error ? err.message : "Unknown error",
    );
    process.exit(1);
  }
}

async function pollForToken(deviceCode: string, interval: number) {
  let pollingInterval = interval;

  return new Promise<void>((resolve) => {
    const poll = async () => {
      try {
        const { data, error } = await authClient.device.token({
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          device_code: deviceCode,
          client_id: CLIENT_ID,
          fetchOptions: {
            headers: {
              "user-agent": "Shadcnify CLI",
            },
          },
        });

        if (data?.access_token) {
          console.log("\n✓ Authorization Successful!");
          console.log("Access token received, fetching user session...");

          // Get user session
          const { data: session, error: sessionError } =
            await authClient.getSession({
              fetchOptions: {
                headers: {
                  Authorization: `Bearer ${data.access_token}`,
                },
              },
            });

          if (sessionError) {
            console.error(
              "❌ Error fetching session:",
              JSON.stringify(sessionError, null, 2),
            );
            process.exit(1);
          }

          if (session?.user) {
            console.log("User session retrieved:", session.user.email);

            // Save authentication
            try {
              await saveAuth(data.access_token, {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              });

              console.log(
                `\n👤 Logged in as: ${session.user.name || session.user.email}`,
              );
              console.log(
                `\n✓ Authentication saved! You can now publish registries.\n`,
              );
            } catch (saveError) {
              console.error("❌ Error saving authentication:", saveError);
              process.exit(1);
            }
          } else {
            console.error(
              "❌ Could not retrieve user session - session data:",
              JSON.stringify(session, null, 2),
            );
            process.exit(1);
          }

          resolve();
          process.exit(0);
        } else if (error) {
          switch (error.error) {
            case "authorization_pending":
              // Continue polling silently
              break;
            case "slow_down":
              pollingInterval += 5;
              console.log(`⚠️  Slowing down polling to ${pollingInterval}s`);
              break;
            case "access_denied":
              console.error("❌ Access was denied by the user");
              process.exit(1);
              break;
            case "expired_token":
              console.error(
                "❌ The device code has expired. Please try again.",
              );
              process.exit(1);
              break;
            default:
              console.error("❌ Error:", error.error_description);
              process.exit(1);
          }
        }
      } catch (err) {
        console.error(
          "❌ Network error:",
          err instanceof Error ? err.message : "Unknown error",
        );
        process.exit(1);
      }

      // Schedule next poll
      setTimeout(poll, pollingInterval * 1000);
    };

    // Start polling
    setTimeout(poll, pollingInterval * 1000);
  });
}

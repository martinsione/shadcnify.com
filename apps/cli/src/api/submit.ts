export interface FileData {
  path: string;
  content: string;
}

export interface RegistryData {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  installCommand: string;
}

export interface SubmitResponse {
  success: boolean;
  error?: string;
  registry?: RegistryData;
}

/**
 * Submit selected files to the API to create a registry
 * @param files Array of file objects with path and content
 * @param name Optional registry name
 * @param description Optional registry description
 * @returns Response indicating success or failure with registry data
 */
export async function submitFiles(
  files: FileData[],
  name?: string,
  description?: string,
): Promise<SubmitResponse> {
  try {
    // API endpoint - configurable via environment variable
    const API_ENDPOINT =
      process.env.API_ENDPOINT || "https://shadcnify.com/api/registry";

    // Try to get authentication token
    const { getStoredAuth } = await import("../utils/auth");
    const auth = await getStoredAuth();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if authenticated
    if (auth?.accessToken) {
      headers["Authorization"] = `Bearer ${auth.accessToken}`;
    }

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name,
        description,
        files,
      }),
    });

    const data = (await response.json()) as {
      success?: boolean;
      error?: string;
      registry?: RegistryData;
    };

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      };
    }

    if (!data.success || !data.registry) {
      return {
        success: false,
        error: "Invalid response from server",
      };
    }

    return {
      success: true,
      registry: data.registry,
    };
  } catch (error) {
    if (error instanceof Error) {
      // Check for network errors
      if (error.message.includes("fetch")) {
        return {
          success: false,
          error: "Network error. Please check your internet connection.",
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Unknown error occurred",
    };
  }
}

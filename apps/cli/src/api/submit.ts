export interface FileData {
  path: string;
  content: string;
}

export interface SubmitResponse {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Submit selected files to the API
 * @param files Array of file objects with path and content
 * @returns Response indicating success or failure
 */
export async function submitFiles(files: FileData[]): Promise<SubmitResponse> {
  try {
    // Placeholder API endpoint - will be configured later
    const API_ENDPOINT =
      process.env.API_ENDPOINT || "http://localhost:3000/api/files";

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

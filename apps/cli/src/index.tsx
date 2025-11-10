import { TextAttributes, createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { listFiles, readMultipleFiles } from "./utils/files";
import { submitFiles, type RegistryData } from "./api/submit";
import { loginCommand } from "./commands/login";
import { whoamiCommand } from "./commands/whoami";
import { logoutCommand } from "./commands/logout";

// Check for command-line commands
const command = process.argv[2];

// Handle commands before starting the React app
if (command && ["login", "whoami", "logout", "help", "--help", "-h"].includes(command)) {
  if (command === "help" || command === "--help" || command === "-h") {
    console.log("Shadcnify CLI - Share your components with the shadcn ecosystem\n");
    console.log("Usage:");
    console.log("  npx shadcnify          Start interactive file selector");
    console.log("  npx shadcnify login    Log in with your GitHub account");
    console.log("  npx shadcnify whoami   Show current logged-in user");
    console.log("  npx shadcnify logout   Log out");
    console.log("  npx shadcnify help     Show this help message\n");
    process.exit(0);
  }
  
  // Handle async commands
  (async () => {
    if (command === "login") {
      await loginCommand();
    } else if (command === "whoami") {
      await whoamiCommand();
    } else if (command === "logout") {
      await logoutCommand();
    }
  })();
} else {
  // Continue with the interactive file selector
  startInteractiveApp();
}

type Mode = "loading" | "selecting" | "submitting" | "success" | "error";

async function startInteractiveApp() {
  function App() {
    const [mode, setMode] = useState<Mode>("loading");
    const [files, setFiles] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [cursorIndex, setCursorIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [registryData, setRegistryData] = useState<RegistryData | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Load files and check authentication on mount
    useEffect(() => {
      (async () => {
        try {
          // Check if user is authenticated
          const { getUser } = await import("./utils/auth");
          const user = await getUser();
          if (user) {
            setUserEmail(user.email);
          }

          // Load files
          const fileList = await listFiles();
          setFiles(fileList);
          setMode("selecting");
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load files",
          );
          setMode("error");
        }
      })();
    }, []);

    // Create Fuse instance when files change (memoized to avoid recreation)
    const fuse = useMemo(() => {
      if (files.length === 0) return null;
      return new Fuse(files, {
        threshold: 0.4,
        distance: 100,
        includeScore: true,
      });
    }, [files]);

    // Compute filtered files (derived state, not stored)
    const filteredFiles = useMemo(() => {
      if (!searchQuery) return files;
      if (!fuse) return files;
      const results = fuse.search(searchQuery);
      return results.map((r) => r.item);
    }, [searchQuery, files, fuse]);

    // Reset cursor when search query changes
    useEffect(() => {
      setCursorIndex(0);
    }, [searchQuery]);

    // Handle keyboard input
    useKeyboard((key) => {
      if (mode !== "selecting") return;

      // Navigation
      if (key.name === "up") {
        setCursorIndex((prev) => Math.max(0, prev - 1));
      } else if (key.name === "down") {
        setCursorIndex((prev) => Math.min(filteredFiles.length - 1, prev + 1));
      }
      // Toggle selection
      else if (key.sequence === " ") {
        const currentFile = filteredFiles[cursorIndex];
        if (currentFile) {
          setSelectedFiles((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(currentFile)) {
              newSet.delete(currentFile);
            } else {
              newSet.add(currentFile);
            }
            return newSet;
          });
        }
      }
      // Submit
      else if (key.name === "return" || key.name === "enter") {
        if (selectedFiles.size > 0) {
          handleSubmit();
        }
      }
      // Backspace to delete search query
      else if (key.name === "backspace" || key.name === "delete") {
        setSearchQuery((prev) => prev.slice(0, -1));
      }
      // Ctrl+C to exit is handled by OpenTUI
      // Type to search
      else if (
        key.sequence &&
        key.sequence.length === 1 &&
        !key.ctrl &&
        !key.meta
      ) {
        setSearchQuery((prev) => prev + key.sequence);
      }
    });

    const handleSubmit = async () => {
      setMode("submitting");

      try {
        // Read file contents
        const filesData = await readMultipleFiles(Array.from(selectedFiles));

        // Submit to API
        const response = await submitFiles(filesData);

        if (response.success && response.registry) {
          setRegistryData(response.registry);
          setMode("success");
        } else {
          setErrorMessage(response.error || "Submission failed");
          setMode("error");
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Submission failed",
        );
        setMode("error");
      }
    };

    // Render loading screen
    if (mode === "loading") {
      return (
        <box
          alignItems="center"
          justifyContent="center"
          flexGrow={1}
          flexDirection="column"
          gap={1}
        >
          <text attributes={TextAttributes.BOLD}>Loading files...</text>
        </box>
      );
    }

    // Render submitting screen
    if (mode === "submitting") {
      return (
        <box
          alignItems="center"
          justifyContent="center"
          flexGrow={1}
          flexDirection="column"
          gap={1}
        >
          <text attributes={TextAttributes.BOLD}>Submitting files...</text>
          <text attributes={TextAttributes.DIM}>
            {selectedFiles.size} file{selectedFiles.size !== 1 ? "s" : ""}{" "}
            selected
          </text>
        </box>
      );
    }

    // Render success screen
    if (mode === "success") {
      return (
        <box
          alignItems="flex-start"
          justifyContent="flex-start"
          flexGrow={1}
          flexDirection="column"
          gap={1}
          paddingTop={2}
        >
          <text attributes={TextAttributes.BOLD}>
            ✓ Registry published successfully!
          </text>
          <box flexDirection="column" paddingTop={1}>
            <text attributes={TextAttributes.DIM}>Registry URL:</text>
            <text>{registryData?.url || "N/A"}</text>
          </box>
          <box flexDirection="column" paddingTop={1}>
            <text attributes={TextAttributes.DIM}>Install with:</text>
            <text attributes={TextAttributes.BOLD}>
              {registryData?.installCommand || "N/A"}
            </text>
          </box>
          <box paddingTop={1}>
            <text attributes={TextAttributes.DIM}>Press Ctrl+C to exit</text>
          </box>
        </box>
      );
    }

    // Render error screen
    if (mode === "error") {
      return (
        <box
          alignItems="center"
          justifyContent="center"
          flexGrow={1}
          flexDirection="column"
          gap={1}
        >
          <text attributes={TextAttributes.BOLD}>✗ Error</text>
          <text>{errorMessage}</text>
          <text attributes={TextAttributes.DIM}>Press Ctrl+C to exit</text>
        </box>
      );
    }

    // Render file selection screen
    // Calculate viewport to use maximum available screen space
    // Reserve space for header (3 lines) + search (2 lines) + footer (3 lines) = 8 lines
    const terminalHeight = process.stdout.rows || 24;
    const maxVisibleFiles = Math.max(5, terminalHeight - 8);

    // Calculate which files to show based on cursor position
    const halfViewport = Math.floor(maxVisibleFiles / 2);
    let visibleStart = Math.max(0, cursorIndex - halfViewport);
    let visibleEnd = Math.min(
      filteredFiles.length,
      visibleStart + maxVisibleFiles,
    );

    // Adjust if we're near the end
    if (
      visibleEnd - visibleStart < maxVisibleFiles &&
      filteredFiles.length > maxVisibleFiles
    ) {
      visibleStart = Math.max(0, visibleEnd - maxVisibleFiles);
    }

    const visibleFiles = filteredFiles.slice(visibleStart, visibleEnd);

    return (
      <box
        flexDirection="column"
        flexGrow={1}
        alignItems="flex-start"
        justifyContent="flex-start"
      >
        {/* Header */}
        <box flexDirection="row" alignItems="flex-start">
          <text attributes={TextAttributes.BOLD}>Select files to publish</text>
          {userEmail && (
            <text attributes={TextAttributes.DIM}> • Logged in as {userEmail}</text>
          )}
        </box>
        <box flexDirection="row" paddingBottom={1} alignItems="flex-start">
          <text attributes={TextAttributes.DIM}>
            Found {files.length} file{files.length !== 1 ? "s" : ""}
            {searchQuery &&
              filteredFiles.length !== files.length &&
              ` - Showing ${filteredFiles.length} match${filteredFiles.length !== 1 ? "es" : ""}`}
          </text>
        </box>

        {/* Search box */}
        <box flexDirection="row" paddingBottom={1} alignItems="flex-start">
          <text attributes={TextAttributes.DIM}>Search: </text>
          <text>{searchQuery || "_"}</text>
        </box>

        {/* File list */}
        <box flexDirection="column" alignItems="flex-start" flexGrow={1}>
          {visibleFiles.length === 0 ? (
            <text attributes={TextAttributes.DIM}>
              {searchQuery ? "No files match your search" : "No files found"}
            </text>
          ) : (
            visibleFiles.map((file, index) => {
              const actualIndex = visibleStart + index;
              const isSelected = selectedFiles.has(file);
              const isCursor = actualIndex === cursorIndex;

              return (
                <box key={file} flexDirection="row" alignItems="flex-start">
                  <text
                    attributes={
                      isCursor ? TextAttributes.BOLD : TextAttributes.NONE
                    }
                  >
                    {isCursor ? "> " : "  "}[{isSelected ? "✓" : " "}] {file}
                  </text>
                </box>
              );
            })
          )}
        </box>

        {/* Footer with instructions */}
        <box flexDirection="row" paddingTop={1} alignItems="flex-start">
          <text attributes={TextAttributes.DIM}>
            Selected: {selectedFiles.size} file
            {selectedFiles.size !== 1 ? "s" : ""}
          </text>
        </box>
        <box flexDirection="row" alignItems="flex-start">
          <text attributes={TextAttributes.DIM}>
            ↑↓: Navigate · Space: Select · Enter: Submit · Type to search ·
            Ctrl+C: Exit
          </text>
        </box>
      </box>
    );
  }

  const renderer = await createCliRenderer();
  createRoot(renderer).render(<App />);
}

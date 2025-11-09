import { TextAttributes, createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { listFiles, readMultipleFiles } from "./utils/files";
import { submitFiles, type RegistryData } from "./api/submit";

type Mode = "loading" | "selecting" | "submitting" | "success" | "error";

function App() {
  const [mode, setMode] = useState<Mode>("loading");
  const [files, setFiles] = useState<string[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [cursorIndex, setCursorIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [registryData, setRegistryData] = useState<RegistryData | null>(null);
  const [fuse, setFuse] = useState<Fuse<string> | null>(null);

  // Load files on mount
  useEffect(() => {
    (async () => {
      try {
        const fileList = await listFiles();
        setFiles(fileList);
        setFilteredFiles(fileList);

        // Initialize Fuse for fuzzy search
        const fuseInstance = new Fuse(fileList, {
          threshold: 0.4,
          distance: 100,
          includeScore: true,
        });
        setFuse(fuseInstance);

        setMode("selecting");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load files",
        );
        setMode("error");
      }
    })();
  }, []);

  // Update filtered files when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredFiles(files);
      setCursorIndex(0);
      return;
    }

    if (fuse) {
      const results = fuse.search(searchQuery);
      setFilteredFiles(results.map((r) => r.item));
      setCursorIndex(0);
    }
  }, [searchQuery, files, fuse]);

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
  const visibleStart = Math.max(0, cursorIndex - 10);
  const visibleEnd = Math.min(filteredFiles.length, cursorIndex + 10);
  const visibleFiles = filteredFiles.slice(visibleStart, visibleEnd);

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      alignItems="flex-start"
      justifyContent="flex-start"
    >
      {/* Header */}
      <box flexDirection="column" paddingBottom={1} alignItems="flex-start">
        <text attributes={TextAttributes.BOLD}>Select files to publish</text>
        <text attributes={TextAttributes.DIM}>
          Found {files.length} file{files.length !== 1 ? "s" : ""}
          {searchQuery &&
            ` · Showing ${filteredFiles.length} match${filteredFiles.length !== 1 ? "es" : ""}`}
        </text>
      </box>

      {/* Search box */}
      <box paddingBottom={1} alignItems="flex-start">
        <text attributes={TextAttributes.DIM}>Search: </text>
        <text>{searchQuery || "_"}</text>
      </box>

      {/* File list */}
      <box flexDirection="column" flexGrow={1} alignItems="flex-start">
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
              <box key={file} alignItems="flex-start">
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
      <box flexDirection="column" paddingTop={1} alignItems="flex-start">
        <text attributes={TextAttributes.DIM}>
          Selected: {selectedFiles.size} file
          {selectedFiles.size !== 1 ? "s" : ""}
        </text>
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

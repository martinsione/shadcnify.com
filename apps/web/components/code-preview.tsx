"use client";

import { CodeEditor } from "@/components/code-editor";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface CodePreviewProps {
  code: string;
  filePath: string;
  registrySlug: string;
  fullContent: string;
}

export function CodePreview({
  code,
  filePath,
  registrySlug,
  fullContent,
}: CodePreviewProps) {
  const [showFade, setShowFade] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const isTruncated = fullContent.split("\n").length > 8;

  useEffect(() => {
    if (editorRef.current && isTruncated) {
      // Wait for CodeMirror to render
      const checkScroll = () => {
        const editor = editorRef.current?.querySelector(".cm-scroller");
        if (editor) {
          const scrollHeight = editor.scrollHeight;
          const clientHeight = editor.clientHeight;
          setShowFade(scrollHeight > clientHeight + 5); // Add small threshold
        }
      };

      // Check immediately and after a short delay
      checkScroll();
      const timeout = setTimeout(checkScroll, 100);

      return () => clearTimeout(timeout);
    }
  }, [code, isTruncated]);

  // Calculate approximate height based on line count
  const lineCount = code.split("\n").length;
  const estimatedHeight = Math.min(Math.max(lineCount * 20, 80), 160);

  return (
    <div className="border rounded-md bg-muted/50 overflow-hidden relative">
      <div className="px-3 py-2 border-b bg-muted/30">
        <code className="text-xs font-mono text-muted-foreground">
          {filePath}
        </code>
      </div>
      <div className="relative" ref={editorRef}>
        <CodeEditor
          value={code}
          filePath={filePath}
          height={`${estimatedHeight}px`}
          editable={false}
          lineNumbers={false}
          lineWrapping={true}
          basicSetup={{
            foldGutter: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            highlightSpecialChars: false,
            drawSelection: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: false,
            bracketMatching: true,
            closeBrackets: false,
            autocompletion: false,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightSelectionMatches: false,
            closeBracketsKeymap: false,
            searchKeymap: false,
            foldKeymap: false,
            completionKeymap: false,
            lintKeymap: false,
          }}
          className="[&_.cm-editor]:bg-transparent [&_.cm-scroller]:overflow-hidden"
        />
        {showFade && isTruncated && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background via-background/80 to-transparent pointer-events-none flex items-end justify-center pb-2">
            <Link
              href={`/registry/${registrySlug}`}
              className="pointer-events-auto text-xs font-medium text-primary hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span>+ view more</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

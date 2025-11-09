"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import { xml } from "@codemirror/lang-xml";
import { markdown } from "@codemirror/lang-markdown";
import { vercelThemeExtension } from "@/lib/codemirror-theme";

interface FileAccordionProps {
  file: {
    path: string;
    content: string;
  };
  index: number;
  onUpdate: (index: number, field: "path" | "content", value: string) => void;
  onRemove: (index: number) => void;
  lineWrapping?: boolean;
}

function getLanguageExtension(filePath: string) {
  const ext = filePath.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "js":
    case "jsx":
      return javascript({ jsx: true });
    case "ts":
    case "tsx":
      return javascript({ jsx: true, typescript: true });
    case "json":
      return json();
    case "css":
    case "scss":
    case "sass":
      return css();
    case "html":
      return html();
    case "xml":
    case "svg":
      return xml();
    case "py":
      return python();
    case "md":
    case "mdx":
      return markdown();
    default:
      return javascript({ jsx: true, typescript: true });
  }
}

export function FileAccordion({
  file,
  index,
  onUpdate,
  onRemove,
  lineWrapping = false,
}: FileAccordionProps) {
  const [isEditingPath, setIsEditingPath] = useState(false);

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={`item-${index}`}
      className="border rounded-lg overflow-hidden bg-card"
    >
      <AccordionItem value={`item-${index}`} className="border-none">
        <div className="flex items-center gap-2 px-4 bg-muted/50">
          <AccordionTrigger className="flex-none hover:no-underline [&>svg]:rotate-270 [&[data-state=open]>svg]:rotate-360" />

          {isEditingPath ? (
            <Input
              value={file.path}
              onChange={(e) => onUpdate(index, "path", e.target.value)}
              onBlur={() => setIsEditingPath(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingPath(false)}
              className="h-7 font-mono text-sm focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingPath(true);
              }}
              className="font-mono text-sm text-foreground hover:text-primary transition-colors flex-1 text-left truncate"
            >
              {file.path || `Untitled-${index + 1}`}
            </button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive flex-none"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <AccordionContent className="pb-0">
          <div className="border-t">
            <CodeMirror
              value={file.content}
              height="300px"
              extensions={[
                getLanguageExtension(file.path),
                ...(lineWrapping ? [EditorView.lineWrapping] : []),
                vercelThemeExtension,
              ]}
              onChange={(value) => onUpdate(index, "content", value)}
              className="font-[family-name:var(--font-jetbrains-mono)]"
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
              }}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: false,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                searchKeymap: true,
                foldKeymap: true,
                completionKeymap: false,
                lintKeymap: true,
              }}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

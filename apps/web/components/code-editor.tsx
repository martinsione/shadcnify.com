"use client";

import { useTheme } from "next-themes";
import CodeMirror from "@uiw/react-codemirror";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import { xml } from "@codemirror/lang-xml";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { cn } from "@/lib/utils";

export function getLanguageExtension(filePath: string): Extension {
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

interface CodeEditorProps {
  value: string;
  filePath: string;
  onChange?: (value: string) => void;
  height?: string;
  editable?: boolean;
  lineNumbers?: boolean;
  lineWrapping?: boolean;
  basicSetup?: {
    lineNumbers?: boolean;
    foldGutter?: boolean;
    highlightActiveLine?: boolean;
    highlightActiveLineGutter?: boolean;
    [key: string]: any;
  };
  className?: string;
}

export function CodeEditor({
  value,
  filePath,
  onChange,
  height = "300px",
  editable = true,
  lineNumbers = true,
  lineWrapping = false,
  basicSetup,
  className,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  const extensions = [
    getLanguageExtension(filePath),
    ...(lineWrapping ? [EditorView.lineWrapping] : []),
    ...(editable ? [] : [EditorView.editable.of(false)]),
  ];

  const defaultBasicSetup = {
    lineNumbers,
    highlightActiveLineGutter: lineNumbers,
    highlightSpecialChars: true,
    foldGutter: lineNumbers,
    drawSelection: true,
    dropCursor: editable,
    allowMultipleSelections: editable,
    indentOnInput: editable,
    bracketMatching: true,
    closeBrackets: editable,
    autocompletion: false,
    rectangularSelection: editable,
    crosshairCursor: editable,
    highlightActiveLine: editable && lineNumbers,
    highlightSelectionMatches: editable,
    closeBracketsKeymap: editable,
    searchKeymap: editable,
    foldKeymap: lineNumbers,
    completionKeymap: false,
    lintKeymap: editable,
    ...basicSetup,
  };

  return (
    <CodeMirror
      value={value}
      height={height}
      theme={resolvedTheme === "dark" ? githubDark : githubLight}
      extensions={extensions}
      onChange={onChange}
      className={cn(
        "**:font-jetbrains-mono [&_.cm-focused]:outline-none! text-sm",
        className
      )}
      basicSetup={defaultBasicSetup}
    />
  );
}

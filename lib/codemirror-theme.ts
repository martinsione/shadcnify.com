import { EditorView } from "@codemirror/view"
import type { Extension } from "@codemirror/state"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { tags as t } from "@lezer/highlight"

// Vercel-inspired dark theme for CodeMirror
export const vercelThemeDark = EditorView.theme(
  {
    "&": {
      color: "#d4d4d4",
      backgroundColor: "#0a0a0a",
      fontSize: "13px",
      fontFamily: "var(--font-jetbrains-mono)",
    },
    ".cm-content": {
      caretColor: "#ffffff",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#ffffff",
    },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "#264f78",
      },
    ".cm-panels": {
      backgroundColor: "#161616",
      color: "#d4d4d4",
    },
    ".cm-panels.cm-panels-top": {
      borderBottom: "1px solid #262626",
    },
    ".cm-panels.cm-panels-bottom": {
      borderTop: "1px solid #262626",
    },
    ".cm-searchMatch": {
      backgroundColor: "#515c6a",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#6c8ab3",
    },
    ".cm-activeLine": {
      backgroundColor: "#161616",
    },
    ".cm-selectionMatch": {
      backgroundColor: "#515c6a",
    },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "#515c6a",
    },
    ".cm-gutters": {
      backgroundColor: "#0a0a0a",
      color: "#6e7681",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#161616",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: "#6e7681",
    },
    ".cm-tooltip": {
      border: "1px solid #262626",
      backgroundColor: "#161616",
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: "#161616",
      borderBottomColor: "#161616",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "#264f78",
        color: "#d4d4d4",
      },
    },
  },
  { dark: true },
)

// Vercel-inspired light theme for CodeMirror
export const vercelThemeLight = EditorView.theme({
  "&": {
    color: "#24292f",
    backgroundColor: "#ffffff",
    fontSize: "13px",
    fontFamily: "var(--font-jetbrains-mono)",
  },
  ".cm-content": {
    caretColor: "#24292f",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "#24292f",
  },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    {
      backgroundColor: "#d4f0ff",
    },
  ".cm-panels": {
    backgroundColor: "#f6f8fa",
    color: "#24292f",
  },
  ".cm-panels.cm-panels-top": {
    borderBottom: "1px solid #e1e4e8",
  },
  ".cm-panels.cm-panels-bottom": {
    borderTop: "1px solid #e1e4e8",
  },
  ".cm-activeLine": {
    backgroundColor: "#f6f8fa",
  },
  ".cm-gutters": {
    backgroundColor: "#fafbfc",
    color: "#57606a",
    border: "none",
    borderRight: "1px solid #e1e4e8",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#f6f8fa",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "transparent",
    border: "none",
    color: "#57606a",
  },
  ".cm-tooltip": {
    border: "1px solid #e1e4e8",
    backgroundColor: "#ffffff",
  },
})

// Syntax highlighting colors matching Vercel's dark style
export const vercelHighlightStyleDark = HighlightStyle.define([
  { tag: t.keyword, color: "#c586c0" },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: "#9cdcfe" },
  { tag: [t.function(t.variableName), t.labelName], color: "#dcdcaa" },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "#4fc1ff" },
  { tag: [t.definition(t.name), t.separator], color: "#d4d4d4" },
  {
    tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
    color: "#4ec9b0",
  },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: "#d4d4d4" },
  { tag: [t.meta, t.comment], color: "#6a9955" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: "#3794ff", textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "#9cdcfe" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#569cd6" },
  { tag: [t.processingInstruction, t.string, t.inserted], color: "#ce9178" },
  { tag: t.invalid, color: "#f44747" },
])

// Syntax highlighting colors matching Vercel's light style
export const vercelHighlightStyleLight = HighlightStyle.define([
  { tag: t.keyword, color: "#cf222e" },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: "#0550ae" },
  { tag: [t.function(t.variableName), t.labelName], color: "#8250df" },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "#0969da" },
  { tag: [t.definition(t.name), t.separator], color: "#24292f" },
  {
    tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
    color: "#0969da",
  },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: "#cf222e" },
  { tag: [t.meta, t.comment], color: "#57606a", fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: "#0969da", textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "#0550ae" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#0969da" },
  { tag: [t.processingInstruction, t.string, t.inserted], color: "#0a3069" },
  { tag: t.invalid, color: "#cf222e" },
])

// Combined extension for dark theme easy use
export const vercelThemeDarkExtension: Extension = [vercelThemeDark, syntaxHighlighting(vercelHighlightStyleDark)]

// Combined extension for light theme easy use
export const vercelThemeLightExtension: Extension = [vercelThemeLight, syntaxHighlighting(vercelHighlightStyleLight)]

// Default export for backward compatibility - uses light theme
export const vercelThemeExtension: Extension = vercelThemeLightExtension

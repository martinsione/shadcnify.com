"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  FileCode,
  Copy,
  Check,
  Calendar,
  ArrowLeft,
  Package,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import {
  getRegistryLikeStatus,
  toggleRegistryLike,
} from "@/app/actions/registry";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";
import { vercelThemeExtension } from "@/lib/codemirror-theme";
import type * as schema from "@/lib/db/schema";

interface RegistryViewProps {
  registry: typeof schema.registries.$inferSelect;
  dependencies: string[];
  registryDependencies: string[];
}
function getLanguageExtension(path: string) {
  const ext = path.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return javascript({ jsx: true, typescript: true });
    case "json":
      return json();
    case "css":
      return css();
    case "html":
      return html();
    default:
      return javascript({ jsx: true, typescript: true });
  }
}

export function RegistryView({
  registry,
  dependencies,
  registryDependencies,
}: RegistryViewProps) {
  const [openFiles, setOpenFiles] = useState<Set<number>>(new Set([0]));
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedFiles, setCopiedFiles] = useState<Set<number>>(new Set());
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLikeLoading, setIsLikeLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      const result = await getRegistryLikeStatus(registry.id);
      if (
        result.success &&
        result.likeCount !== undefined &&
        result.isLiked !== undefined
      ) {
        setLikeCount(result.likeCount);
        setIsLiked(result.isLiked);
      }
    };

    fetchLikeStatus();
  }, [registry.id]);

  const handleLikeToggle = async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const result = await toggleRegistryLike(registry.id);
      if (
        result.success &&
        result.likeCount !== undefined &&
        result.isLiked !== undefined
      ) {
        setLikeCount(result.likeCount);
        setIsLiked(result.isLiked);
      } else {
        // Revert on error
        setIsLiked(previousIsLiked);
        setLikeCount(previousLikeCount);
        toast.error(result.error || "Failed to toggle like");
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      toast.error("Failed to toggle like");
    } finally {
      setIsLikeLoading(false);
    }
  };

  const toggleFile = (index: number) => {
    const newOpenFiles = new Set(openFiles);
    if (newOpenFiles.has(index)) {
      newOpenFiles.delete(index);
    } else {
      newOpenFiles.add(index);
    }
    setOpenFiles(newOpenFiles);
  };

  const copyCommand = async () => {
    const command = `npx shadcn@latest add https://shadcnify.com/r/${registry.id}`;
    await navigator.clipboard.writeText(command);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const copyFileContent = async (index: number, content: string) => {
    await navigator.clipboard.writeText(content);
    const newCopiedFiles = new Set(copiedFiles);
    newCopiedFiles.add(index);
    setCopiedFiles(newCopiedFiles);
    setTimeout(() => {
      setCopiedFiles((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 2000);
  };

  const files = registry.files as Array<{ path: string; content: string }>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="text-2xl font-semibold font-mono">{registry.name}</h1>
          {registry.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {registry.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>
                Created {new Date(registry.createdAt).toLocaleDateString()}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeToggle}
              disabled={isLikeLoading}
              className="h-7 gap-2 px-2 hover:text-red-500 transition-colors"
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span className="text-xs">
                {likeCount} {likeCount === 1 ? "like" : "likes"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-6 mb-6">
          <h2 className="text-sm font-medium mb-3">Installation Command</h2>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-4 py-3 rounded-md text-sm font-mono overflow-x-auto">
              npx shadcn@latest add https://shadcnify.com/r/{registry.id}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyCommand}
              className="gap-2 bg-transparent"
            >
              {copiedCommand ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </Card>

        {(dependencies.length > 0 || registryDependencies.length > 0) && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Dependencies</h2>
            </div>

            <div className="space-y-4">
              {dependencies.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">
                    NPM Packages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {dependencies.map((dep) => (
                      <code
                        key={dep}
                        className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md text-xs font-mono"
                      >
                        {dep}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {registryDependencies.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">
                    shadcn/ui Components
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {registryDependencies.map((dep) => (
                      <code
                        key={dep}
                        className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md text-xs font-mono"
                      >
                        {dep}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-medium">Files ({files.length})</h2>

          {files.map((file, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden bg-card"
            >
              <div className="flex items-center gap-3 p-4 bg-muted/50">
                <button
                  onClick={() => toggleFile(index)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${openFiles.has(index) ? "rotate-90" : ""}`}
                  />
                </button>

                <FileCode className="h-4 w-4 text-muted-foreground" />

                <span className="font-mono text-sm flex-1">{file.path}</span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyFileContent(index, file.content)}
                  className="gap-2 h-8"
                >
                  {copiedFiles.has(index) ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span className="text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </Button>
              </div>

              {openFiles.has(index) && (
                <div className="border-t">
                  <CodeMirror
                    value={file.content}
                    extensions={[
                      getLanguageExtension(file.path),
                      EditorView.editable.of(false),
                      EditorView.lineWrapping,
                      vercelThemeExtension,
                    ]}
                    editable={false}
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLineGutter: false,
                      highlightActiveLine: false,
                      foldGutter: true,
                    }}
                    className="font-[family-name:var(--font-jetbrains-mono)]"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

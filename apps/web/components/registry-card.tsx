"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Package,
  ExternalLink,
  FileText,
  Heart,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CodePreview } from "@/components/code-preview";
import { deleteRegistry } from "@/app/actions/registry";
import { toast } from "sonner";
import type * as schema from "@/lib/db/schema";
import {
  extractDependencies,
  extractRegistryDependencies,
} from "@/lib/utils/dependency-parser";
import { useTimeAgo } from "@/lib/hooks/use-timeago";

interface RegistryCardProps {
  registry: typeof schema.registries.$inferSelect & { likeCount: number };
}

export function RegistryCard({ registry }: RegistryCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const timeAgo = useTimeAgo(registry.createdAt);

  const files = registry.files as Array<{
    path: string;
    content: string;
  }>;

  // Extract dependencies from all files
  const allDependencies = new Set<string>();
  const allRegistryDependencies = new Set<string>();

  files.forEach((file) => {
    const deps = extractDependencies(file.content);
    const regDeps = extractRegistryDependencies(file.content);
    deps.forEach((dep) => allDependencies.add(dep));
    regDeps.forEach((dep) => allRegistryDependencies.add(dep));
  });

  // Get first file for preview - show more lines
  const firstFile = files[0];
  const previewLines =
    firstFile?.content.split("\n").slice(0, 8).join("\n") || "";

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteRegistry(registry.id);
        if (result.success) {
          toast.success("Registry deleted successfully");
          setIsDeleteDialogOpen(false);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to delete registry");
        }
      } catch (error) {
        toast.error("Failed to delete registry");
      }
    });
  };

  return (
    <>
      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group relative">
        <Link href={`/registry/${registry.id}`} className="block">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold font-mono truncate group-hover:text-primary transition-colors">
                  {registry.name}
                </h3>
              </div>
              {registry.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {registry.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{timeAgo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  <span>
                    {files.length} {files.length === 1 ? "file" : "files"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3" />
                  <span>{registry.likeCount}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/registry/${registry.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Link>
              </Button>
            </div>
          </div>

          {/* Dependencies */}
          {(allDependencies.size > 0 || allRegistryDependencies.size > 0) && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Package className="h-3 w-3" />
                <span className="font-medium">Dependencies</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(allDependencies)
                  .slice(0, 5)
                  .map((dep) => (
                    <code
                      key={dep}
                      className="inline-flex items-center bg-muted px-2 py-0.5 rounded text-xs font-mono text-muted-foreground"
                    >
                      {dep}
                    </code>
                  ))}
                {allDependencies.size > 5 && (
                  <code className="inline-flex items-center bg-muted px-2 py-0.5 rounded text-xs font-mono text-muted-foreground">
                    +{allDependencies.size - 5} more
                  </code>
                )}
                {Array.from(allRegistryDependencies)
                  .slice(0, 3)
                  .map((dep) => (
                    <code
                      key={dep}
                      className="inline-flex items-center bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-mono"
                    >
                      {dep}
                    </code>
                  ))}
                {allRegistryDependencies.size > 3 && (
                  <code className="inline-flex items-center bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-mono">
                    +{allRegistryDependencies.size - 3} more
                  </code>
                )}
              </div>
            </div>
          )}

          {/* File structure preview */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <FileText className="h-3 w-3" />
              <span className="font-medium">Files</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {files.slice(0, 4).map((file, idx) => (
                <code
                  key={idx}
                  className="inline-flex items-center bg-muted px-2 py-0.5 rounded text-xs font-mono text-muted-foreground"
                >
                  {file.path.split("/").pop()}
                </code>
              ))}
              {files.length > 4 && (
                <code className="inline-flex items-center bg-muted px-2 py-0.5 rounded text-xs font-mono text-muted-foreground">
                  +{files.length - 4} more
                </code>
              )}
            </div>
          </div>

          {/* Code preview */}
          {previewLines && firstFile && (
            <CodePreview
              code={previewLines}
              filePath={firstFile.path}
              registryId={registry.id}
              fullContent={firstFile.content}
            />
          )}
        </Link>

        {/* Delete button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDeleteDialogOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Registry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{registry.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

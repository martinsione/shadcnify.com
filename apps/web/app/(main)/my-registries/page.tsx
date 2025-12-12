import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/get-session";
import { getRegistriesByUserId, getRegistryLikeCount } from "@/lib/db/queries";
import {
  Calendar,
  Package,
  ExternalLink,
  GithubIcon,
  FileText,
  Heart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CodePreview } from "@/components/code-preview";
import { DeleteRegistryButton } from "@/components/delete-registry-button";
import {
  extractDependencies,
  extractRegistryDependencies,
} from "@/lib/utils/dependency-parser";
import { TimeAgo } from "@/components/timeago";
import { RegistriesLoadingSkeleton } from "@/components/registry-card-skeleton";

async function RegistriesContent() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return (
      <div className="text-center py-12">
        <GithubIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Sign in to view your registries
        </h3>
        <p className="text-sm text-muted-foreground">
          Sign in with GitHub to create and manage your registries
        </p>
      </div>
    );
  }

  const registries = await getRegistriesByUserId(user.id);

  // Fetch like counts for all registries in parallel
  const registriesWithLikes = await Promise.all(
    registries.map(async (registry) => {
      const likeCount = await getRegistryLikeCount(registry.id);
      return { ...registry, likeCount };
    }),
  );

  if (registriesWithLikes.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No registries yet</h3>
        <p className="text-sm text-muted-foreground">
          Create your first registry to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {registriesWithLikes.map((registry) => {
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

        return (
          <div key={registry.id} className="relative group">
            <Card className="p-6 hover:shadow-md transition-shadow">
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
                      <TimeAgo date={registry.createdAt} />
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
                <div className="w-24 shrink-0" />
              </div>

              {/* Dependencies */}
              {(allDependencies.size > 0 ||
                allRegistryDependencies.size > 0) && (
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
              {firstFile && (
                <CodePreview
                  code={firstFile.content}
                  filePath={firstFile.path}
                  registryId={registry.id}
                  fullContent={firstFile.content}
                />
              )}
            </Card>
            <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
              <DeleteRegistryButton
                registryId={registry.id}
                registryName={registry.name}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/registry/${registry.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View registry</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MyRegistriesPage() {
  return (
    <Suspense fallback={<RegistriesLoadingSkeleton />}>
      <RegistriesContent />
    </Suspense>
  );
}


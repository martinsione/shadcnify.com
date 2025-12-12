import { Card } from "@/components/ui/card";

export function RegistryCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          {/* Title skeleton */}
          <div className="h-6 w-48 bg-muted animate-pulse rounded mb-3" />
          {/* Description skeleton */}
          <div className="h-4 w-72 bg-muted animate-pulse rounded mb-3" />
          {/* Meta info skeleton */}
          <div className="flex items-center gap-4 mb-3">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="w-24 shrink-0" />
      </div>

      {/* Dependencies skeleton */}
      <div className="mb-3">
        <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
        <div className="flex flex-wrap gap-1.5">
          <div className="h-6 w-16 bg-muted animate-pulse rounded" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded" />
          <div className="h-6 w-14 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Files skeleton */}
      <div className="mb-3">
        <div className="h-4 w-12 bg-muted animate-pulse rounded mb-2" />
        <div className="flex flex-wrap gap-1.5">
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Code preview skeleton */}
      <div className="rounded-md border overflow-hidden">
        <div className="h-8 bg-muted/50 border-b" />
        <div className="p-4 space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </Card>
  );
}

export function RegistriesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <RegistryCardSkeleton />
      <RegistryCardSkeleton />
      <RegistryCardSkeleton />
    </div>
  );
}


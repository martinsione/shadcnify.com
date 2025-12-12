import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function RegistryLoading() {
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
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
          <div className="flex items-center gap-4 mt-3">
            <div className="h-5 w-24 bg-muted animate-pulse rounded" />
            <div className="h-5 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-6 mb-6">
          <div className="h-4 w-32 bg-muted animate-pulse rounded mb-3" />
          <div className="flex items-center gap-2">
            <div className="flex-1 h-10 bg-muted animate-pulse rounded-md" />
            <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />
          </div>
        </Card>

        <div className="space-y-3">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <Card className="p-4">
            <div className="h-6 w-48 bg-muted animate-pulse rounded mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}


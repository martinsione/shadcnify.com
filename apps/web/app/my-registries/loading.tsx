import { Header } from "@/components/header";
import { RegistriesLoadingSkeleton } from "@/components/registry-card-skeleton";

export default function MyRegistriesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <RegistriesLoadingSkeleton />
      </main>
    </div>
  );
}

import { Suspense } from "react";
import { Header } from "@/components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense>
        <Header />
      </Suspense>
      <main className="container mx-auto px-4 py-8 max-w-3xl">{children}</main>
    </div>
  );
}

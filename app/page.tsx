import { RegistryForm } from "@/components/registry-form"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <h1 className="text-2xl font-semibold font-mono">shadcn registry generator</h1>
          <p className="text-sm text-muted-foreground mt-1">Share your components with the shadcn ecosystem</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <RegistryForm />
      </main>
    </div>
  )
}

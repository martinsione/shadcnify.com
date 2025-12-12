import { UserButton } from "./user-button";
import { HeaderNav } from "./header-nav";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold font-mono">
              shadcn registry generator
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Share your components with the shadcn ecosystem
            </p>
          </div>
          <div className="flex justify-end">
            <UserButton />
          </div>
        </div>
        <div className="h-9">
          <HeaderNav />
        </div>
      </div>
    </header>
  );
}

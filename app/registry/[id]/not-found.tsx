import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <FileQuestion className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Registry Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          The registry you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}

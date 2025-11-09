"use client";

import { useState } from "react";
import { Plus, Loader2, WrapText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileAccordion } from "@/components/file-accordion";
import { useRouter } from "next/navigation";
import { createRegistry } from "@/app/actions/registry";
import { toast } from "sonner";

export function RegistryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([
    {
      path: "components/example.tsx",
      content:
        "function Greet({ name }: { name: string }) {\n  return (\n    <div>hello {name}!</div>\n  )\n}",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lineWrapping, setLineWrapping] = useState(false);

  const addFile = () => {
    const untitledNumbers = files
      .map((f) => {
        const match = f.path.match(/^Untitled-(\d+)/);
        return match ? Number.parseInt(match[1], 10) : null;
      })
      .filter((n): n is number => n !== null);

    let nextNumber = 1;
    while (untitledNumbers.includes(nextNumber)) {
      nextNumber++;
    }

    setFiles([...files, { path: `Untitled-${nextNumber}`, content: "" }]);
  };

  const updateFile = (
    index: number,
    field: "path" | "content",
    value: string,
  ) => {
    const newFiles = [...files];
    newFiles[index] = { ...newFiles[index], [field]: value };
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    if (files.length > 1) {
      setFiles(files.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a registry name");
      return;
    }

    if (files.some((f) => !f.path.trim())) {
      toast.error("Please provide file paths for all files");
      return;
    }

    if (files.some((f) => !f.content.trim())) {
      toast.error("Please add content to all files");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createRegistry({ name, description, files });

      if (result.error) {
        throw new Error(result.details || result.error);
      }

      if (result.success && result.registry) {
        toast.success("Registry created successfully!");
        router.push(`/registry/${result.registry.id}`);
      }
    } catch (error) {
      toast.error(
        `Failed to create registry: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-32">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Registry Name</Label>
          <Input
            id="name"
            placeholder="my-awesome-component"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="A brief description of your component..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Files</Label>
          <div className="space-y-3">
            {files.map((file, index) => (
              <FileAccordion
                key={index}
                file={file}
                index={index}
                onUpdate={updateFile}
                onRemove={removeFile}
                lineWrapping={lineWrapping}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-full shadow-lg transition-all duration-300">
          {isSubmitting ? (
            <div className="px-6 py-3 flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Publishing...</span>
            </div>
          ) : (
            <div className="px-3 py-2 flex items-center gap-2">
              {/* Tools section */}
              <Button
                type="button"
                variant={lineWrapping ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setLineWrapping(!lineWrapping)}
                className="gap-1.5 rounded-full px-3"
                title="Toggle line wrapping"
              >
                <WrapText className="h-3.5 w-3.5" />
                <span className="text-xs">Wrap</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addFile}
                className="gap-1.5 rounded-full px-3"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs">Add File</span>
              </Button>

              <Separator orientation="vertical" className="h-5" />

              <Button
                onClick={handleSubmit}
                size="sm"
                className="rounded-full px-4"
              >
                <span className="text-xs font-medium">Publish</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

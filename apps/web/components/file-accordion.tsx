"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CodeEditor } from "@/components/code-editor";

interface FileAccordionProps {
  file: {
    path: string;
    content: string;
  };
  index: number;
  onUpdate?: (index: number, field: "path" | "content", value: string) => void;
  onRemove?: (index: number) => void;
  lineWrapping?: boolean;
}

export function FileAccordion({
  file,
  index,
  onUpdate,
  onRemove,
  lineWrapping = false,
}: FileAccordionProps) {
  const [isEditingPath, setIsEditingPath] = useState(false);

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={`item-${index}`}
      className="border rounded-lg overflow-hidden bg-card"
    >
      <AccordionItem value={`item-${index}`} className="border-none">
        <div className="flex items-center gap-2 px-4 bg-muted/50">
          <AccordionTrigger className="flex-none hover:no-underline [&>svg]:rotate-270 [&[data-state=open]>svg]:rotate-360" />

          {onUpdate && isEditingPath ? (
            <Input
              value={file.path}
              onChange={(e) => onUpdate(index, "path", e.target.value)}
              onBlur={() => setIsEditingPath(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingPath(false)}
              className="h-7 font-mono text-sm focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingPath(true);
              }}
              className="font-mono text-sm text-foreground hover:text-primary transition-colors flex-1 text-left truncate"
            >
              {file.path || `Untitled-${index + 1}`}
            </button>
          )}

          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive flex-none"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <AccordionContent className="pb-0">
          <div className="border-t">
            <CodeEditor
              value={file.content}
              filePath={file.path}
              onChange={(value) => onUpdate?.(index, "content", value)}
              editable={!!onUpdate}
              lineWrapping={lineWrapping}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

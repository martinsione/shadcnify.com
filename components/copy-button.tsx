"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function CopyButton({
  text,
  label = "Copy",
  variant = "outline",
  size = "sm",
}: CopyButtonProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => copyToClipboard(text)}
      className="gap-2"
    >
      {isCopied ? (
        <>
          <Check className="h-4 w-4" />
          {label === "Copy" ? "Copied" : `${label}d`}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}

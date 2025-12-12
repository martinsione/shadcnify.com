"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleRegistryLike } from "@/app/actions/registry";

interface LikeButtonProps {
  registryId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
}

export function LikeButton({
  registryId,
  initialLikeCount,
  initialIsLiked,
}: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();

  const [optimisticLike, setOptimisticLike] = useOptimistic(
    { count: initialLikeCount, isLiked: initialIsLiked },
    (state, newIsLiked: boolean) => ({
      count: newIsLiked ? state.count + 1 : state.count - 1,
      isLiked: newIsLiked,
    })
  );

  const handleLikeToggle = () => {
    startTransition(async () => {
      setOptimisticLike(!optimisticLike.isLiked);

      const result = await toggleRegistryLike(registryId);
      if (!result.success) {
        toast.error(result.error || "Failed to toggle like");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLikeToggle}
      disabled={isPending}
      className="h-7 gap-2 px-2 hover:text-red-500 transition-colors"
    >
      <Heart
        className={`h-4 w-4 transition-all ${optimisticLike.isLiked ? "fill-red-500 text-red-500 scale-110" : ""}`}
      />
      <span className="text-xs">
        {optimisticLike.count} {optimisticLike.count === 1 ? "like" : "likes"}
      </span>
    </Button>
  );
}


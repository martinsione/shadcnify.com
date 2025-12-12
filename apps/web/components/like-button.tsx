"use client";

import { useOptimistic, useTransition, useState, useEffect } from "react";
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

  // Track the confirmed server state (updated after successful server actions)
  const [confirmedState, setConfirmedState] = useState({
    count: initialLikeCount,
    isLiked: initialIsLiked,
  });

  // Sync with props when they change (e.g., from server revalidation)
  useEffect(() => {
    setConfirmedState({
      count: initialLikeCount,
      isLiked: initialIsLiked,
    });
  }, [initialLikeCount, initialIsLiked]);

  // useOptimistic uses confirmedState as the base, not props directly
  const [optimisticLike, setOptimisticLike] = useOptimistic(
    confirmedState,
    (state, newIsLiked: boolean) => ({
      count: newIsLiked ? state.count + 1 : state.count - 1,
      isLiked: newIsLiked,
    })
  );

  const handleLikeToggle = () => {
    const newIsLiked = !optimisticLike.isLiked;

    startTransition(async () => {
      // Show optimistic UI immediately
      setOptimisticLike(newIsLiked);

      const result = await toggleRegistryLike(registryId);

      if (result.success) {
        // Update confirmed state with server response
        setConfirmedState({
          count: result.likeCount!,
          isLiked: result.isLiked!,
        });
      } else {
        toast.error(result.error || "Failed to toggle like");
        // On error, the optimistic state will revert to confirmedState
        // which still has the old values, so UI stays consistent
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


import { getRegistryLikeCount, hasUserLikedRegistry } from "@/lib/db/queries";
import { getCurrentUser } from "@/lib/auth/get-session";
import { LikeButton } from "./like-button";

interface LikesLoaderProps {
  registryId: string;
}

// Async server component that fetches fresh likes data
export async function LikesLoader({ registryId }: LikesLoaderProps) {
  const user = await getCurrentUser();

  const [likeCount, isLiked] = await Promise.all([
    getRegistryLikeCount(registryId),
    user?.id ? hasUserLikedRegistry(user.id, registryId) : Promise.resolve(false),
  ]);

  return (
    <LikeButton
      registryId={registryId}
      initialLikeCount={likeCount}
      initialIsLiked={isLiked}
    />
  );
}

// Skeleton for loading state
export function LikesSkeleton() {
  return (
    <div className="h-7 w-16 bg-muted animate-pulse rounded-md" />
  );
}


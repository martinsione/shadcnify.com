"use client";

import { useTimeAgo } from "@/lib/hooks/use-timeago";

interface TimeAgoProps {
  date: Date | string;
}

export function TimeAgo({ date }: TimeAgoProps) {
  const timeAgo = useTimeAgo(date);
  return <span>{timeAgo}</span>;
}


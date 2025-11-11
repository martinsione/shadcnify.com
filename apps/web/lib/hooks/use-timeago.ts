import { useState, useEffectEvent } from "react";
import { formatDistanceToNow } from "date-fns";

function useInterval(callback: () => void, delay: number) {
  useEffectEvent(() => {
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  });
}

export function useTimeAgo(date: Date | string): string {
  const [timeAgo, setTimeAgo] = useState(() =>
    formatDistanceToNow(new Date(date), { addSuffix: true })
  );

  useInterval(() => {
    setTimeAgo(formatDistanceToNow(new Date(date), { addSuffix: true }));
  }, 30000);

  return timeAgo;
}

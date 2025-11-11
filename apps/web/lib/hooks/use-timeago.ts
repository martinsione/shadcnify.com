import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

export function useTimeAgo(date: Date | string): string {
  const [timeAgo, setTimeAgo] = useState(() =>
    formatDistanceToNow(new Date(date), { addSuffix: true })
  );

  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(formatDistanceToNow(new Date(date), { addSuffix: true }));
    };

    // Update immediately
    updateTimeAgo();

    // Update every 30 seconds for recent times, every minute for older times
    const interval = setInterval(updateTimeAgo, 30000);

    return () => clearInterval(interval);
  }, [date]);

  return timeAgo;
}


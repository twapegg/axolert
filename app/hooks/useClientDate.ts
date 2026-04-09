import { useState, useEffect } from "react";

export function useClientDate() {
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    // Only set the date on the client side to avoid hydration mismatch
    const updateDate = () => {
      const now = new Date();
      // Use a consistent format that works the same on server and client
      setDate(
        now.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateDate();
    // Update every second
    const interval = setInterval(updateDate, 1000);

    return () => clearInterval(interval);
  }, []);

  return date;
}

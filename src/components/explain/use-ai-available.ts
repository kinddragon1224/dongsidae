import { useEffect, useState } from "react";
import { getAiStatus } from "@/lib/ai/explain";

export function useAiAvailable() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void getAiStatus().then((res) => {
      if (!cancelled) setAvailable(res.available);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return available;
}

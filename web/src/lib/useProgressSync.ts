"use client";

import { useEffect } from "react";

export function useProgressSync(onSync: () => void) {
  useEffect(() => {
    onSync();
    window.addEventListener("storage", onSync);
    window.addEventListener("progress_updated", onSync);
    return () => {
      window.removeEventListener("storage", onSync);
      window.removeEventListener("progress_updated", onSync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

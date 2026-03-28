"use client";

import { useState, useEffect } from "react";
import { markChapterRead, getChapterProgress } from "@/lib/progress";

export default function MarkReadButton({ slug }: { slug: string }) {
  const [read, setRead] = useState(false);

  useEffect(() => {
    setRead(getChapterProgress(slug).read);
  }, [slug]);

  function handleClick() {
    markChapterRead(slug);
    setRead(true);
  }

  if (read) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border"
        style={{ borderColor: "#4ade80", color: "#4ade80", backgroundColor: "rgba(74, 222, 128, 0.08)" }}
      >
        <span>✓</span>
        <span>已读完</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-white/5 cursor-pointer"
      style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
    >
      标记已读
    </button>
  );
}

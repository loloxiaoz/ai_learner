"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/chapters";

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    // 正文滚动容器是 <main>，用它作为 IntersectionObserver 的 root
    const scrollRoot = document.querySelector("main") ?? null;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { root: scrollRoot, rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-0.5">
      <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
        本章目录
      </p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(h.id);
            const main = document.querySelector("main");
            if (el && main) {
              main.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
            }
            setActiveId(h.id);
          }}
          style={{
            display: "block",
            paddingLeft: h.level === 3 ? "1.25rem" : "0.5rem",
            paddingTop: "0.3rem",
            paddingBottom: "0.3rem",
            fontSize: h.level === 2 ? "0.8rem" : "0.75rem",
            color: activeId === h.id ? "var(--color-accent)" : "var(--color-text-muted)",
            borderLeft: `2px solid ${activeId === h.id ? "var(--color-accent)" : "transparent"}`,
            lineHeight: 1.4,
            transition: "color 0.15s, border-color 0.15s",
            textDecoration: "none",
          }}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}

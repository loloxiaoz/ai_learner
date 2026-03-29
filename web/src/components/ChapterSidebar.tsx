"use client";

import { useState } from "react";
import Link from "next/link";
import type { Chapter } from "@/lib/chapters";

interface Props {
  chapters: Chapter[];
  currentSlug: string;
}

export default function ChapterSidebar({ chapters, currentSlug }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="sticky top-14 shrink-0 self-start border-r transition-all duration-300"
      style={{
        width: collapsed ? 48 : 220,
        maxHeight: "calc(100vh - 3.5rem)",
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
        overflowY: collapsed ? "visible" : "auto",
        overflowX: "hidden",
      }}
    >
      {/* 收起按钮 */}
      <div
        className="flex items-center border-b px-3 py-3"
        style={{ borderColor: "var(--color-border)", justifyContent: collapsed ? "center" : "space-between" }}
      >
        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
            课程目录
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 transition-colors hover:bg-white/5"
          style={{ color: "var(--color-text-muted)" }}
          title={collapsed ? "展开" : "收起"}
        >
          {collapsed ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* 章节列表 */}
      {collapsed ? (
        <div className="py-2">
          {chapters.map((ch) => (
            <Link
              key={ch.slug}
              href={`/learn/${ch.slug}`}
              title={`第 ${String(ch.order).padStart(2, "0")} 章 · ${ch.title}`}
              className="flex items-center justify-center py-2.5 text-xs font-mono transition-colors hover:text-white"
              style={{
                color: ch.slug === currentSlug ? "var(--color-accent)" : "var(--color-text-muted)",
                backgroundColor: ch.slug === currentSlug ? "rgba(124,109,250,0.1)" : "transparent",
              }}
            >
              {String(ch.order).padStart(2, "0")}
            </Link>
          ))}
        </div>
      ) : (
        <nav className="py-2">
          {chapters.map((ch) => {
            const active = ch.slug === currentSlug;
            return (
              <Link
                key={ch.slug}
                href={`/learn/${ch.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5"
                style={{
                  backgroundColor: active ? "rgba(124,109,250,0.1)" : "transparent",
                  borderRight: active ? "2px solid var(--color-accent)" : "2px solid transparent",
                }}
              >
                <span
                  className="shrink-0 font-mono text-xs"
                  style={{ color: active ? "var(--color-accent)" : "var(--color-text-muted)" }}
                >
                  {String(ch.order).padStart(2, "0")}
                </span>
                <span
                  className="text-sm leading-snug"
                  style={{
                    color: active ? "var(--color-text)" : "var(--color-text-muted)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {ch.title}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </aside>
  );
}

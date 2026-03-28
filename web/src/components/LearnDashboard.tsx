"use client";

import { useState } from "react";
import Link from "next/link";
import { loadProgress, getOverallProgress, MASTERY_COLORS, MASTERY_LABELS, type MasteryLevel } from "@/lib/progress";
import { useProgressSync } from "@/lib/useProgressSync";
import type { Chapter } from "@/lib/chapters";

interface ProgressSnapshot {
  overall: number;
  chapters: Record<string, { read: boolean; mastery: MasteryLevel }>;
}

function buildSnapshot(slugs: string[]): ProgressSnapshot {
  const data = loadProgress();
  return {
    overall: getOverallProgress(slugs),
    chapters: Object.fromEntries(
      slugs.map((s) => [s, data.chapters[s] ?? { read: false, mastery: 0 }])
    ),
  };
}

export default function LearnDashboard({ chapters }: { chapters: Chapter[] }) {
  const slugs = chapters.map((c) => c.slug);
  const [snap, setSnap] = useState<ProgressSnapshot>(() => buildSnapshot(slugs));

  // 支持多标签页同步（storage）和同页更新（progress_updated）
  useProgressSync(() => setSnap(buildSnapshot(slugs)));

  const completedCount = slugs.filter((s) => snap.chapters[s]?.mastery >= 3).length;

  return (
    <div className="space-y-8">
      <div
        className="p-6 rounded-2xl border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>总学习进度</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {completedCount} / {chapters.length} 章基本掌握 · 数据存储在本地
            </p>
          </div>
          <span className="text-3xl font-bold font-mono" style={{ color: "var(--color-accent)" }}>
            {snap.overall}%
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-2)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${snap.overall}%`, backgroundColor: "var(--color-accent)" }}
          />
        </div>
        <div className="flex gap-4 mt-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span>阅读正文 +1分</span>
          <span>自测评估 +1~4分</span>
          <span>每章满分 5分</span>
        </div>
      </div>

      <div className="space-y-3">
        {chapters.map((chapter) => {
          const cp = snap.chapters[chapter.slug] ?? { read: false, mastery: 0 as MasteryLevel };
          const masteryColor = MASTERY_COLORS[cp.mastery as MasteryLevel];

          return (
            <div
              key={chapter.slug}
              className="flex items-stretch rounded-xl border overflow-hidden transition-all hover:border-purple-500/30"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              <div
                className="flex items-center justify-center w-14 shrink-0 font-mono text-sm font-bold"
                style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent)" }}
              >
                {String(chapter.order).padStart(2, "0")}
              </div>

              <div className="flex-1 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                    {chapter.title}
                  </h3>
                  {cp.read && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(74,222,128,0.1)", color: "#4ade80" }}>
                      已读
                    </span>
                  )}
                  {cp.mastery > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${masteryColor}18`, color: masteryColor }}
                    >
                      {MASTERY_LABELS[cp.mastery as MasteryLevel]}
                    </span>
                  )}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-2)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(cp.mastery / 4) * 100}%`, backgroundColor: masteryColor }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-3 justify-center shrink-0">
                <Link
                  href={`/learn/${chapter.slug}`}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium text-center transition-all hover:opacity-90"
                  style={{ backgroundColor: "var(--color-accent)", color: "white" }}
                >
                  阅读
                </Link>
                <Link
                  href={`/learn/${chapter.slug}/quiz`}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium text-center border transition-all hover:bg-white/5"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                >
                  自测
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

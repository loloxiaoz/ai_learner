"use client";

import { useState } from "react";
import { KNOWLEDGE_TAGS } from "@/lib/tags";
import { loadProgress, MASTERY_COLORS, type MasteryLevel } from "@/lib/progress";
import { useProgressSync } from "@/lib/useProgressSync";

// 章节筛选按钮列表是静态的，无需在每次渲染时重建
const CHAPTER_SLUGS = Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, "0"));

const MASTERY_LEGEND: { level: MasteryLevel; label: string }[] = [
  { level: 1, label: "初学" },
  { level: 2, label: "学习中" },
  { level: 3, label: "基本掌握" },
  { level: 4, label: "熟练掌握" },
];

function fontSize(weight: 1 | 2 | 3, mastery: MasteryLevel): string {
  const base = [0.7, 0.8, 0.95][weight - 1];
  return `${(base + mastery * 0.07).toFixed(2)}rem`;
}

function tagColor(mastery: MasteryLevel): string {
  return mastery === 0 ? "#3a3a4e" : MASTERY_COLORS[mastery];
}

function tagBg(mastery: MasteryLevel): string {
  return mastery === 0 ? "transparent" : `${MASTERY_COLORS[mastery]}12`;
}

function loadMastery(): Record<string, MasteryLevel> {
  const data = loadProgress();
  return Object.fromEntries(
    Object.entries(data.chapters).map(([slug, cp]) => [slug, cp.mastery as MasteryLevel])
  );
}

export default function TagCloud() {
  const [chapterMastery, setChapterMastery] = useState<Record<string, MasteryLevel>>(loadMastery);
  const [filter, setFilter] = useState<string | null>(null);

  useProgressSync(() => setChapterMastery(loadMastery()));

  const visibleTags = filter ? KNOWLEDGE_TAGS.filter((t) => t.chapter === filter) : KNOWLEDGE_TAGS;
  const masteredCount = KNOWLEDGE_TAGS.filter((t) => (chapterMastery[t.chapter] ?? 0) >= 3).length;

  return (
    <div
      className="p-5 rounded-2xl border h-fit sticky top-20"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>知识点掌握图</h2>
        <span className="text-xs font-mono" style={{ color: "var(--color-accent)" }}>
          {masteredCount}/{KNOWLEDGE_TAGS.length}
        </span>
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
        完成自测评估后点亮对应知识点
      </p>

      <div className="flex flex-wrap gap-1 mb-4">
        <button
          onClick={() => setFilter(null)}
          className="text-xs px-2 py-0.5 rounded transition-all cursor-pointer"
          style={{
            backgroundColor: filter === null ? "var(--color-accent)" : "var(--color-surface-2)",
            color: filter === null ? "white" : "var(--color-text-muted)",
          }}
        >
          全部
        </button>
        {CHAPTER_SLUGS.map((ch) => (
          <button
            key={ch}
            onClick={() => setFilter(filter === ch ? null : ch)}
            className="text-xs px-2 py-0.5 rounded transition-all cursor-pointer font-mono"
            style={{
              backgroundColor: filter === ch ? "var(--color-accent)" : "var(--color-surface-2)",
              color: filter === ch ? "white" : "var(--color-text-muted)",
            }}
          >
            {ch}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {visibleTags.map((tag) => {
          const mastery = (chapterMastery[tag.chapter] ?? 0) as MasteryLevel;
          const color = tagColor(mastery);
          return (
            <span
              key={`${tag.chapter}-${tag.name}`}
              className="inline-flex items-center px-2 py-0.5 rounded-full border transition-all"
              style={{
                fontSize: fontSize(tag.weight, mastery),
                color: mastery > 0 ? color : "#4a4a60",
                borderColor: mastery > 0 ? `${color}40` : "#2a2a3a",
                backgroundColor: tagBg(mastery),
                fontWeight: mastery >= 3 ? 600 : 400,
              }}
            >
              {tag.name}{mastery > 0 ? " " + "★".repeat(mastery) : ""}
            </span>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t space-y-1.5" style={{ borderColor: "var(--color-border)" }}>
        {MASTERY_LEGEND.map(({ level, label }) => (
          <div key={level} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: MASTERY_COLORS[level] }} />
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {"★".repeat(level)} {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

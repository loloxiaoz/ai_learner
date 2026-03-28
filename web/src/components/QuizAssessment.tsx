"use client";

import { useState, useEffect } from "react";
import { setChapterMastery, getChapterProgress, MASTERY_LABELS, MASTERY_COLORS, type MasteryLevel } from "@/lib/progress";

const OPTIONS: { level: MasteryLevel; emoji: string; desc: string }[] = [
  { level: 1, emoji: "🌱", desc: "初学——大部分答不上来" },
  { level: 2, emoji: "📖", desc: "学习中——能答一半左右" },
  { level: 3, emoji: "💡", desc: "基本掌握——大部分能答出要点" },
  { level: 4, emoji: "🚀", desc: "熟练掌握——能流利回答并举一反三" },
];

export default function QuizAssessment({ slug }: { slug: string }) {
  const [current, setCurrent] = useState<MasteryLevel>(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = getChapterProgress(slug);
    setCurrent(p.mastery);
    if (p.mastery > 0) setSaved(true);
  }, [slug]);

  function handleSelect(level: MasteryLevel) {
    setCurrent(level);
    setSaved(false);
  }

  function handleSave() {
    setChapterMastery(slug, current);
    setSaved(true);
  }

  return (
    <div
      className="mt-16 p-6 rounded-2xl border"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
    >
      <h3 className="font-semibold text-base mb-1" style={{ color: "var(--color-text)" }}>
        完成自测后——评估你的掌握程度
      </h3>
      <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
        诚实评估比高估更有助于学习
      </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {OPTIONS.map(({ level, emoji, desc }) => {
          const isSelected = current === level;
          return (
            <button
              key={level}
              onClick={() => handleSelect(level)}
              className="flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer hover:bg-white/[0.03]"
              style={{
                borderColor: isSelected ? MASTERY_COLORS[level] : "var(--color-border)",
                backgroundColor: isSelected ? `${MASTERY_COLORS[level]}15` : "var(--color-surface-2)",
              }}
            >
              <span className="text-xl shrink-0">{emoji}</span>
              <div>
                <div className="text-xs font-medium mb-0.5" style={{ color: isSelected ? MASTERY_COLORS[level] : "var(--color-text)" }}>
                  {MASTERY_LABELS[level]}
                </div>
                <div className="text-xs leading-snug" style={{ color: "var(--color-text-muted)" }}>{desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={current === 0}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{ backgroundColor: current > 0 ? MASTERY_COLORS[current] : "var(--color-surface-2)", color: "white" }}
        >
          {saved ? "✓ 已保存" : "保存评估"}
        </button>
        {saved && (
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            进度已更新到课程总览
          </span>
        )}
      </div>
    </div>
  );
}

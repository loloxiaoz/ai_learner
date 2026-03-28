export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

export interface ChapterProgress {
  read: boolean;
  mastery: MasteryLevel; // 0=未开始 1=初学 2=学习中 3=基本掌握 4=熟练掌握
}

export interface ProgressData {
  chapters: Record<string, ChapterProgress>;
}

const STORAGE_KEY = "ai_learner_progress";

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  0: "未开始",
  1: "初学",
  2: "学习中",
  3: "基本掌握",
  4: "熟练掌握",
};

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  0: "#2a2a3a",
  1: "#f59e0b",
  2: "#3b82f6",
  3: "#7c6dfa",
  4: "#4ade80",
};

export function loadProgress(): ProgressData {
  if (typeof window === "undefined") return { chapters: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { chapters: {} };
    return JSON.parse(raw) as ProgressData;
  } catch {
    return { chapters: {} };
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function markChapterRead(slug: string): void {
  const data = loadProgress();
  data.chapters[slug] = {
    read: true,
    mastery: data.chapters[slug]?.mastery ?? 0,
  };
  saveProgress(data);
}

export function setChapterMastery(slug: string, mastery: MasteryLevel): void {
  const data = loadProgress();
  data.chapters[slug] = {
    read: data.chapters[slug]?.read ?? false,
    mastery,
  };
  saveProgress(data);
}

export function getChapterProgress(slug: string): ChapterProgress {
  const data = loadProgress();
  return data.chapters[slug] ?? { read: false, mastery: 0 };
}

// 全局进度百分比：每章 read=+5%，mastery 最高再加 5%（共 100%）
export function getOverallProgress(slugs: string[]): number {
  if (slugs.length === 0) return 0;
  const data = loadProgress();
  let total = 0;
  for (const slug of slugs) {
    const ch = data.chapters[slug];
    if (!ch) continue;
    if (ch.read) total += 1;
    total += ch.mastery; // 0-4
  }
  // max per chapter = 1 (read) + 4 (mastery) = 5
  return Math.round((total / (slugs.length * 5)) * 100);
}

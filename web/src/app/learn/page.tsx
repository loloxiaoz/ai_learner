import Link from "next/link";
import { getAllChapters } from "@/lib/chapters";
import LearnDashboard from "@/components/LearnDashboard";
import TagCloud from "@/components/TagCloud";

export default function LearnPage() {
  const chapters = getAllChapters();

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <nav className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>课程</span>
        </div>
        <Link
          href="/visualize/attention"
          className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5 flex items-center gap-1.5"
          style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)" }}
        >
          ◎ Transformer 动画
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>课程总览</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            共 {chapters.length} 章 · 阅读正文 + 完成自测 = 进度更新
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：章节列表 + 进度 */}
          <div className="lg:col-span-2">
            <LearnDashboard chapters={chapters} />
          </div>

          {/* 右侧：知识点 Tag 云 */}
          <div className="lg:col-span-1">
            <TagCloud />
          </div>
        </div>
      </div>
    </main>
  );
}

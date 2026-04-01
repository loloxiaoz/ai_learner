import Link from "next/link";
import { getAllChapters } from "@/lib/chapters";

export default function HomePage() {
  const chapters = getAllChapters();

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      {/* 顶部导航 */}
      <nav className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold" style={{ color: "var(--color-accent)" }}>AI Learner</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text-muted)" }}>v0.1 beta</span>
        </div>
        <div className="flex gap-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/learn" className="hover:text-white transition-colors">课程</Link>
          <Link href="/visualize" className="hover:text-white transition-colors">可视化</Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full mb-8 border" style={{ borderColor: "var(--color-border)", color: "var(--color-accent-2)", backgroundColor: "var(--color-surface)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--color-accent-2)" }}></span>
          面向工程师的大模型系统学习路径
        </div>

        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: "var(--color-text)" }}>
          从工程师到
          <span style={{ color: "var(--color-accent)" }}> AI 工程师</span>
        </h1>

        <p className="text-xl mb-4 max-w-2xl mx-auto" style={{ color: "var(--color-text-muted)" }}>
          10 章系统课程，涵盖深度学习原理、Transformer 架构、
          <br />大模型训练与微调、RAG 与 Agent。
        </p>
        <p className="text-base mb-10" style={{ color: "var(--color-text-muted)" }}>
          内容干货 · 进度可视化 · 理解可验证 · 完全免费开源
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/learn"
            className="px-8 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            开始学习
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-lg font-medium transition-all hover:bg-white/5 border"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            Star on GitHub
          </a>
        </div>
      </section>

      {/* 特性亮点 */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "◈",
              title: "10 章系统内容",
              desc: "从 AI 基础到前沿趋势，知识点完整，适合面试与答辩场景",
            },
            {
              icon: "▦",
              title: "进度追踪可视化",
              desc: "章节进度条 + 知识点掌握度 Tag 云，一眼看清学习盲区",
            },
            {
              icon: "◎",
              title: "可交互动画",
              desc: "Transformer 注意力机制可视化，拖拽探索，真正理解原理",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-xl border"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="text-2xl mb-3" style={{ color: "var(--color-accent)" }}>{f.icon}</div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>{f.title}</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 课程目录预览 */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--color-text)" }}>课程目录</h2>
        <div className="space-y-2">
          {chapters.map((chapter) => (
            <Link
              key={chapter.slug}
              href={`/learn/${chapter.slug}`}
              className="flex items-center gap-4 p-4 rounded-lg border transition-all hover:border-purple-500/40 hover:bg-white/[0.02] group"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              <span className="font-mono text-sm w-6 text-right shrink-0" style={{ color: "var(--color-accent)" }}>
                {String(chapter.order).padStart(2, "0")}
              </span>
              <span className="flex-1 font-medium" style={{ color: "var(--color-text)" }}>{chapter.title}</span>
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-text-muted)" }}>
                开始阅读 →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
        <p>开源免费 · CC BY-SA 4.0 · 欢迎贡献</p>
      </footer>
    </main>
  );
}

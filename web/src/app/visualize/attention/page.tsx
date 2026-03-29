import Link from "next/link";
import AttentionVisualizer from "@/components/AttentionVisualizer";

export const metadata = {
  title: "Transformer 注意力可视化 — AI Learner",
  description: "交互式探索 Transformer 自注意力机制，理解 Q/K/V 矩阵如何捕捉语言中的依存关系",
};

export default function AttentionPage() {
  return (
    <div className="min-h-screen viz-page" style={{ backgroundColor: "var(--color-background)" }}>
      <nav className="sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
          <span>/</span>
          <Link href="/learn" className="hover:text-white transition-colors">课程</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>Transformer 注意力可视化</span>
        </div>
        <Link
          href="/learn/03"
          className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          → 第 3 章正文
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* 标题 */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86, 212, 179, 0.08)" }}
          >
            ◎ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            Transformer 自注意力机制
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm leading-relaxed">
            Transformer 中每个词通过 <strong style={{ color: "var(--color-text)" }}>Q/K/V 矩阵</strong> 计算与其他词的相关性。
            不同的「注意力头」捕捉不同类型的语言模式——主谓关系、修饰关系、远程依存……
            下面通过真实例子来感受这个过程。
          </p>
        </div>

        {/* 可视化主体 */}
        <AttentionVisualizer />

        {/* 延伸阅读 */}
        <div
          className="mt-12 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 3 章《Transformer 架构深度解析》，了解多头注意力和位置编码的完整原理</p>
            <p>→ 现实中的大模型（如 GPT-4）有 96 层、96 个注意力头，每个头学到的模式远比这里复杂</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Flash Attention</strong> 通过分块计算显著降低内存消耗，是当前推理优化的核心技术</p>
          </div>
        </div>
      </div>
    </div>
  );
}

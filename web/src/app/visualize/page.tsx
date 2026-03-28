import Link from "next/link";

export const metadata = {
  title: "可视化专区 — AI Learner",
};

export default function VisualizePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <nav className="border-b px-6 py-3 flex items-center gap-2 text-sm" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text-muted)" }}>
        <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
        <span>/</span>
        <span style={{ color: "var(--color-text)" }}>可视化专区</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>可视化专区</h1>
        <p className="text-sm mb-10" style={{ color: "var(--color-text-muted)" }}>
          核心 AI 概念的交互式动画，帮你真正理解抽象原理
        </p>

        <div className="grid gap-4">
          <Link
            href="/visualize/attention"
            className="p-6 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl shrink-0" style={{ color: "var(--color-accent)" }}>◎</div>
              <div>
                <h2 className="font-semibold mb-1" style={{ color: "var(--color-text)" }}>Transformer 自注意力机制</h2>
                <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
                  悬停探索注意力热图，切换多头视角，直观感受 Q/K/V 如何捕捉语言中的依存关系
                </p>
                <div className="flex gap-2">
                  {["Q/K/V 矩阵", "多头注意力", "注意力热图"].map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(124,109,250,0.12)", color: "var(--color-accent)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="ml-auto text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>
                进入 →
              </span>
            </div>
          </Link>

          <Link
            href="/visualize/backprop"
            className="p-6 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl shrink-0" style={{ color: "var(--color-accent)" }}>⟳</div>
              <div>
                <h2 className="font-semibold mb-1" style={{ color: "var(--color-text)" }}>反向传播梯度流动</h2>
                <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
                  逐步演示前向传播、损失计算、链式法则求导到权重更新的完整过程，悬停查看每个连接的梯度数值
                </p>
                <div className="flex gap-2">
                  {["梯度下降", "链式法则", "权重更新"].map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(124,109,250,0.12)", color: "var(--color-accent)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="ml-auto text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>
                进入 →
              </span>
            </div>
          </Link>

          <Link
            href="/visualize/rag"
            className="p-6 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl shrink-0" style={{ color: "var(--color-accent)" }}>⊞</div>
              <div>
                <h2 className="font-semibold mb-1" style={{ color: "var(--color-text)" }}>RAG 检索增强全流程</h2>
                <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
                  可视化向量空间中的语义检索，逐步演示 Embedding → 相似度检索 → 上下文增强 → LLM 生成的完整 RAG 链路
                </p>
                <div className="flex gap-2">
                  {["向量检索", "文档召回", "增强生成"].map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(124,109,250,0.12)", color: "var(--color-accent)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="ml-auto text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>
                进入 →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

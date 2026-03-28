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

          {/* 占位：后续动画 */}
          {[
            { icon: "⟳", title: "反向传播梯度流动", tags: ["梯度下降", "链式法则", "权重更新"], coming: true },
            { icon: "⊞", title: "RAG 检索增强全流程", tags: ["向量检索", "文档召回", "增强生成"], coming: true },
          ].map(({ icon, title, tags }) => (
            <div
              key={title}
              className="p-6 rounded-xl border opacity-50"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl shrink-0" style={{ color: "var(--color-text-muted)" }}>{icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>{title}</h2>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text-muted)" }}>即将上线</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text-muted)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

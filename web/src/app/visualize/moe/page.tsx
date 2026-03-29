import Link from "next/link";
import MoEVisualizer from "@/components/MoEVisualizer";

export const metadata = {
  title: "MoE 混合专家路由可视化 — AI Learner",
  description: "交互式演示 Mixture of Experts 稀疏激活：不同 Token 如何被动态路由到 Top-2 专家",
};

export default function MoEPage() {
  return (
    <div className="min-h-screen viz-page" style={{ backgroundColor: "var(--color-background)" }}>
      <nav className="sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
          <span>/</span>
          <Link href="/visualize" className="hover:text-white transition-colors">可视化专区</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>MoE 混合专家路由</span>
        </div>
        <Link href="/learn/10" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>→ 第 10 章正文</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86,212,179,0.08)" }}>
            ⑃ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>MoE 混合专家路由</h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Mixtral、DeepSeek-MoE 等前沿大模型采用
            <strong style={{ color: "var(--color-text)" }}>混合专家（Mixture of Experts）</strong>架构：
            设置多个并行的 FFN「专家」，每个 Token 由路由器动态分配给最适合的 Top-2 专家处理，
            其余专家不参与计算——在不增加推理成本的情况下大幅扩展模型参数量。
          </p>
        </div>
        <MoEVisualizer />
        <div className="mt-10 p-5 rounded-xl border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 10 章《前沿趋势与实战总结》，了解 MoE 在 DeepSeek-V3、GPT-4 中的应用</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Expert Choice vs Token Choice：</strong>传统 MoE 由 Token 选专家（可能负载不均）；Expert Choice 改为专家选 Token（天然均衡）</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Fine-grained MoE：</strong>DeepSeek-MoE 将专家拆分更细（64 个小专家选 Top-8），比粗粒度 MoE 专业化程度更高</p>
          </div>
        </div>
      </div>
    </div>
  );
}

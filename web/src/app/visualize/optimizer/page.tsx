import Link from "next/link";
import OptimizerVisualizer from "@/components/OptimizerVisualizer";

export const metadata = {
  title: "梯度下降优化器对比 — AI Learner",
  description: "交互式对比 SGD、Momentum、RMSProp、Adam 在 2D 损失曲面上的收敛轨迹",
};

export default function OptimizerPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <nav
        className="sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
          <span>/</span>
          <Link href="/visualize" className="hover:text-white transition-colors">可视化专区</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>梯度下降优化器对比</span>
        </div>
        <Link
          href="/learn/02"
          className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          → 第 2 章正文
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86, 212, 179, 0.08)" }}
          >
            ◈ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            梯度下降优化器对比
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm leading-relaxed">
            同一起点、同一损失曲面，
            <strong style={{ color: "var(--color-text)" }}>SGD、Momentum、RMSProp、Adam</strong>
            四种优化器的收敛轨迹截然不同。点击「重新开始」观察各自路径，拖动进度条逐帧分析。
          </p>
        </div>

        <OptimizerVisualizer />

        <div
          className="mt-10 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 2 章《深度学习核心原理》，了解梯度下降的完整数学推导</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>学习率调度（LR Scheduler）</strong>：Warmup + Cosine Decay 是大模型训练的标准配置</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>AdamW</strong>：Adam + 权重衰减解耦，BERT/GPT 系列默认优化器</p>
          </div>
        </div>
      </div>
    </div>
  );
}

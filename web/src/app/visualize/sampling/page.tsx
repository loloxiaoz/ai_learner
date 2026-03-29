import Link from "next/link";
import SamplingVisualizer from "@/components/SamplingVisualizer";

export const metadata = {
  title: "LLM 采样策略可视化 — AI Learner",
  description: "交互式调整 Temperature、Top-K、Top-P，直观理解大模型解码策略如何影响生成结果",
};

export default function SamplingPage() {
  return (
    <div className="min-h-screen viz-page" style={{ backgroundColor: "var(--color-background)" }}>
      <nav
        className="sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
          <span>/</span>
          <Link href="/visualize" className="hover:text-white transition-colors">可视化专区</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>LLM 采样策略</span>
        </div>
        <Link
          href="/learn/08"
          className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          → 第 8 章正文
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86, 212, 179, 0.08)" }}
          >
            🎲 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            LLM 采样策略
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm leading-relaxed">
            大模型每次生成一个 Token，通过
            <strong style={{ color: "var(--color-text)" }}> Temperature / Top-K / Top-P </strong>
            三个参数控制生成的随机性与多样性。
            拖动滑块实时观察候选词的概率分布变化，点击「采样一个词」模拟一次真实的生成过程。
          </p>
        </div>

        <SamplingVisualizer />

        <div
          className="mt-10 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 8 章《推理优化与部署》，了解 KV Cache、投机解码等加速推理的关键技术</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>贪心解码（Greedy）</strong>：始终选择最高概率词，temperature→0 的极限，确定性最强但多样性最差</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Beam Search</strong>：维护 K 条候选序列，取最终最优路径，机器翻译场景下效果好于纯采样</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Min-P 采样</strong>：新兴方法，以最高概率的比例动态设置截止阈值，比 Top-P 更稳定</p>
          </div>
        </div>
      </div>
    </div>
  );
}

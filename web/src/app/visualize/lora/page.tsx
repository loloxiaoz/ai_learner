import Link from "next/link";
import LoRAVisualizer from "@/components/LoRAVisualizer";

export const metadata = {
  title: "LoRA 低秩矩阵分解可视化 — AI Learner",
  description: "交互式探索 LoRA 参数高效微调：拖动秩 r 滑块，对比参数量节省与矩阵热图变化",
};

export default function LoRAPage() {
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
          <span style={{ color: "var(--color-text)" }}>LoRA 低秩矩阵分解</span>
        </div>
        <Link
          href="/learn/06"
          className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          → 第 6 章正文
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86, 212, 179, 0.08)" }}
          >
            ⊗ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            LoRA 低秩矩阵分解
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm leading-relaxed">
            全参微调一个 7B 模型需要 &gt;100GB 显存，而 LoRA 用两个小矩阵 B×A 近似权重更新 ΔW，
            参数量减少 <strong style={{ color: "var(--color-text)" }}>99%+</strong>。
            拖动秩 r 滑块，直观看到低秩分解如何在参数量与表达能力之间权衡。
          </p>
        </div>

        <LoRAVisualizer />

        <div
          className="mt-10 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 6 章《大模型微调技术》，了解 LoRA、Adapter、Prompt Tuning 的完整对比</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>LoRA 秩的选择：</strong>通常 r=4~64，任务越复杂可适当增大；r 等于权重矩阵秩时退化为全参微调</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>DoRA（权重分解 LoRA）：</strong>将权重分解为幅度和方向，更接近全参微调的学习动态</p>
          </div>
        </div>
      </div>
    </div>
  );
}

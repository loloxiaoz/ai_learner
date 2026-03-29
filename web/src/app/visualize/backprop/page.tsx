import Link from "next/link";
import BackpropVisualizer from "@/components/BackpropVisualizer";

export const metadata = {
  title: "反向传播可视化 — AI Learner",
  description: "交互式探索神经网络反向传播，理解梯度下降、链式法则与权重更新的完整过程",
};

export default function BackpropPage() {
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
          <span style={{ color: "var(--color-text)" }}>反向传播梯度流动</span>
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
        {/* 标题 */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86, 212, 179, 0.08)" }}
          >
            ⟳ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            反向传播梯度流动
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm leading-relaxed">
            反向传播是深度学习的核心算法。它利用<strong style={{ color: "var(--color-text)" }}>链式法则</strong>从损失函数出发，
            逐层向后计算每个权重的梯度，再通过<strong style={{ color: "var(--color-text)" }}>梯度下降</strong>更新参数。
            点击下方步骤，逐步观察一次完整的参数更新过程。
          </p>
        </div>

        {/* 可视化主体 */}
        <BackpropVisualizer />

        {/* 延伸学习 */}
        <div
          className="mt-12 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 2 章《深度学习核心原理》，了解激活函数、梯度消失与批归一化的完整原理</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>梯度消失</strong>问题：网络层数增多时，靠近输入层的梯度趋近于零，导致参数几乎不更新——ReLU 和残差连接是主要解决方案</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Adam 优化器</strong>在基础梯度下降之上引入动量和自适应学习率，是目前最常用的优化器</p>
          </div>
        </div>
      </div>
    </div>
  );
}

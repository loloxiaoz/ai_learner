import Link from "next/link";
import ActivationVisualizer from "@/components/ActivationVisualizer";

export const metadata = {
  title: "激活函数与梯度消失 — AI Learner",
  description: "交互式对比 Sigmoid、Tanh、ReLU、Leaky ReLU、GELU 激活函数曲线及其导数，直观理解梯度消失问题",
};

export default function ActivationPage() {
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
          <span style={{ color: "var(--color-text)" }}>激活函数与梯度消失</span>
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
            ƒ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            激活函数与梯度消失
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm leading-relaxed">
            激活函数赋予神经网络非线性建模能力。选择不当会导致
            <strong style={{ color: "var(--color-text)" }}>梯度消失</strong>，
            使深层网络无法训练。开启「显示导数」，观察各激活函数在饱和区的梯度衰减现象。
          </p>
        </div>

        <ActivationVisualizer />

        <div
          className="mt-10 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 2 章《深度学习核心原理》，了解批归一化（BatchNorm）和残差连接如何配合激活函数缓解梯度问题</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Swish / SiLU</strong>：Google 提出的平滑激活函数，兼具 ReLU 的稀疏性和 GELU 的平滑性</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>GLU 门控线性单元</strong>：LLaMA/Mistral 中使用 SwiGLU，成为现代大模型 FFN 层的主流激活</p>
          </div>
        </div>
      </div>
    </div>
  );
}

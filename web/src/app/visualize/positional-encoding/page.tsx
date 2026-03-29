import Link from "next/link";
import PositionalEncodingVisualizer from "@/components/PositionalEncodingVisualizer";

export const metadata = {
  title: "位置编码可视化 — AI Learner",
  description: "交互式探索 Transformer 正弦/余弦位置编码矩阵，直观理解不同频率如何编码序列位置信息",
};

export default function PositionalEncodingPage() {
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
          <span style={{ color: "var(--color-text)" }}>位置编码热图</span>
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
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86, 212, 179, 0.08)" }}
          >
            ≋ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            Transformer 位置编码热图
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm leading-relaxed">
            原版 Transformer 用<strong style={{ color: "var(--color-text)" }}>正弦/余弦函数</strong>生成位置编码矩阵，
            行对应序列位置，列对应模型维度。点击格子查看具体数值和计算公式，
            切换曲线模式观察不同频率维度如何随位置变化。
          </p>
        </div>

        <PositionalEncodingVisualizer />

        <div
          className="mt-10 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 3 章《Transformer 架构深度解析》，了解位置编码在整体架构中的位置</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>可学习位置编码（Learned PE）</strong>：BERT/GPT 使用可训练的嵌入向量替代固定 sin/cos 编码</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>RoPE（旋转位置编码）</strong>：LLaMA/Qwen 等现代大模型采用，将位置信息编入注意力计算，支持长度外推</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>ALiBi</strong>：用注意力偏置替代位置编码，线性外推能力更强</p>
          </div>
        </div>
      </div>
    </div>
  );
}

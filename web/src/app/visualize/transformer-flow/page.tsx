import Link from "next/link";
import TransformerFlowVisualizer from "@/components/TransformerFlowVisualizer";

export const metadata = {
  title: "Transformer 完整数据流 — AI Learner",
  description: "逐层动画展示 Token 如何流经 Embedding、多头注意力、FFN 到输出 Logits 的完整 Transformer 前向传播",
};

export default function TransformerFlowPage() {
  return (
    <div className="min-h-screen viz-page" style={{ backgroundColor: "var(--color-background)" }}>
      <nav className="sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
          <span>/</span>
          <Link href="/visualize" className="hover:text-white transition-colors">可视化专区</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>Transformer 数据流</span>
        </div>
        <Link href="/learn/03" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>→ 第 3 章正文</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86,212,179,0.08)" }}>
            ↕ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>Transformer 完整数据流</h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            一个 Token 是如何「穿越」整个 Transformer 的？从输入 ID 到输出概率分布，
            每一层都在做什么、维度如何变化——逐层点击查看
            <strong style={{ color: "var(--color-text)" }}>公式、说明与维度图示</strong>。
          </p>
        </div>
        <TransformerFlowVisualizer />
        <div className="mt-10 p-5 rounded-xl border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 3 章《Transformer 架构深度解析》，了解 Pre-LN vs Post-LN、Flash Attention 等现代改进</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Pre-Norm vs Post-Norm：</strong>原始 Transformer 用 Post-Norm（LN 在残差后），GPT 改为 Pre-Norm（LN 在残差前），训练更稳定</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Weight Tying：</strong>Embedding 矩阵与 LM Head 共享权重（W_E 转置），GPT-2 等模型均采用此技巧减少参数</p>
          </div>
        </div>
      </div>
    </div>
  );
}

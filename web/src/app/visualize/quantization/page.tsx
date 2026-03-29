import Link from "next/link";
import QuantizationVisualizer from "@/components/QuantizationVisualizer";

export const metadata = {
  title: "模型量化精度对比 — AI Learner",
  description: "交互式对比 FP32/BF16/FP16/INT8/INT4 量化精度与显存占用，直观理解量化误差和模型压缩权衡",
};

export default function QuantizationPage() {
  return (
    <div className="min-h-screen viz-page" style={{ backgroundColor: "var(--color-background)" }}>
      <nav className="sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
          <span>/</span>
          <Link href="/visualize" className="hover:text-white transition-colors">可视化专区</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>模型量化精度对比</span>
        </div>
        <Link href="/learn/08" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>→ 第 8 章正文</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86,212,179,0.08)" }}>
            ▦ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>模型量化精度对比</h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            量化是将模型权重从高精度浮点数压缩为低精度整数的技术，
            以<strong style={{ color: "var(--color-text)" }}>少量精度损失</strong>换取
            显著的显存节省和推理加速。
            切换量化格式，观察权重分布直方图的变化、量化误差大小，以及不同模型在各量化格式下的实际显存占用。
          </p>
        </div>
        <QuantizationVisualizer />
        <div className="mt-10 p-5 rounded-xl border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 8 章《推理优化与部署》，了解量化与 KV Cache、投机解码的组合使用</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>混合精度量化（Mixed Precision）：</strong>注意力层保持 FP16，FFN 权重用 INT4，在压缩率和精度之间取得最佳平衡</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>GGUF 格式：</strong>llama.cpp 使用的量化格式，支持 Q2_K/Q4_K/Q8_0 等多种粒度，可在 CPU 上高效推理</p>
          </div>
        </div>
      </div>
    </div>
  );
}

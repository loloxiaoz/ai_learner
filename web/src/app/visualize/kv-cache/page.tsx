import Link from "next/link";
import KVCacheVisualizer from "@/components/KVCacheVisualizer";

export const metadata = {
  title: "KV Cache 推理加速可视化 — AI Learner",
  description: "动画演示 KV Cache 机制：对比有无缓存时的计算量，直观理解大模型推理为何需要 KV Cache",
};

export default function KVCachePage() {
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
          <span style={{ color: "var(--color-text)" }}>KV Cache 推理加速</span>
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
            ▣ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            KV Cache 推理加速
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm leading-relaxed">
            大模型每次生成 Token 时，注意力层需要所有历史 Token 的 Key/Value 矩阵。
            没有缓存时，每步都重新计算全部历史 K/V，时间复杂度 O(n²)；
            KV Cache 将计算过的 K/V 存入显存，后续步骤直接读取，复杂度降至 <strong style={{ color: "var(--color-text)" }}>O(n)</strong>。
          </p>
        </div>

        <KVCacheVisualizer />

        <div
          className="mt-10 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 8 章《推理优化与部署》，了解投机解码、模型量化等更多推理加速技术</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>PagedAttention（vLLM）：</strong>将 KV Cache 按「页」管理，解决碎片化问题，吞吐量提升 10-20×</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>RadixAttention：</strong>共享相同前缀的请求复用 KV Cache，适合系统 Prompt 相同的批量推理场景</p>
          </div>
        </div>
      </div>
    </div>
  );
}

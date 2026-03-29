import Link from "next/link";
import TokenizerVisualizer from "@/components/TokenizerVisualizer";

export const metadata = {
  title: "BPE 分词可视化 — AI Learner",
  description: "交互式演示 BPE（Byte Pair Encoding）分词过程，逐步观察字符对合并操作如何构建子词词表",
};

export default function TokenizerPage() {
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
          <span style={{ color: "var(--color-text)" }}>BPE 分词过程</span>
        </div>
        <Link
          href="/learn/04"
          className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          → 第 4 章正文
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86, 212, 179, 0.08)" }}
          >
            ⌁ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            BPE 分词过程
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm leading-relaxed">
            大模型不直接处理字符或单词，而是处理
            <strong style={{ color: "var(--color-text)" }}>子词 Token（Subword）</strong>。
            BPE 从字符级起步，反复合并最高频的字符对，最终构建出兼顾效率与覆盖率的词表。
            GPT-4 的词表约 10 万个 Token，一个中文字通常对应 1~2 个 Token。
          </p>
        </div>

        <TokenizerVisualizer />

        <div
          className="mt-10 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 4 章《大语言模型架构演进》，了解从 GPT-1 到 GPT-4 词表设计的演变</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Tokenizer 的坑：</strong>空格、大小写、特殊字符都会影响分词结果，错误的 tokenize 可能导致模型在数学/代码任务上出错</p>
            <p>→ 可在 <code className="px-1 rounded text-xs" style={{ backgroundColor: "var(--color-surface-2)" }}>platform.openai.com/tokenizer</code> 实验不同文本的真实分词效果</p>
          </div>
        </div>
      </div>
    </div>
  );
}

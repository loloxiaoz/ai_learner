import Link from "next/link";
import WordEmbeddingVisualizer from "@/components/WordEmbeddingVisualizer";

export const metadata = {
  title: "词向量语义空间 — AI Learner",
  description: "交互式探索词向量 2D 语义空间，悬停查看近邻词，演示 king−man+woman=queen 类比运算",
};

export default function WordEmbeddingPage() {
  return (
    <div className="min-h-screen viz-page" style={{ backgroundColor: "var(--color-background)" }}>
      <nav className="sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
          <span>/</span>
          <Link href="/visualize" className="hover:text-white transition-colors">可视化专区</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>词向量语义空间</span>
        </div>
        <Link href="/learn/04" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>→ 第 4 章正文</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86,212,179,0.08)" }}>
            ✦ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>词向量语义空间</h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            大模型的 Embedding 层将每个词映射为高维向量，意义相近的词在空间中彼此靠近。
            这里展示 PCA 降维后的 2D 视图——悬停查看近邻词，点击类比按钮演示
            <strong style={{ color: "var(--color-text)" }}> king − man + woman = queen </strong>的向量算术。
          </p>
        </div>
        <WordEmbeddingVisualizer />
        <div className="mt-10 p-5 rounded-xl border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 4 章《大语言模型架构演进》，了解从 Word2Vec 到 Contextual Embedding 的演变</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>上下文向量 vs 静态向量：</strong>Word2Vec「bank」永远同一个向量；BERT/GPT 中「bank」根据上下文（银行/河岸）动态变化</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Sentence Embedding：</strong>对整句话产生一个向量，RAG 中用于语义检索的正是 Sentence Embedding</p>
          </div>
        </div>
      </div>
    </div>
  );
}

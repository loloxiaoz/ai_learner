import Link from "next/link";
import RAGVisualizer from "@/components/RAGVisualizer";

export const metadata = {
  title: "RAG 全流程可视化 — AI Learner",
  description: "交互式探索检索增强生成（RAG）全流程：Embedding 向量化、相似度检索、上下文增强、LLM 生成",
};

export default function RAGPage() {
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
          <span style={{ color: "var(--color-text)" }}>RAG 检索增强生成</span>
        </div>
        <Link
          href="/learn/09"
          className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          → 第 9 章正文
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 标题 */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86, 212, 179, 0.08)" }}
          >
            ⊞ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            RAG 检索增强生成全流程
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm leading-relaxed">
            RAG（Retrieval-Augmented Generation）在生成答案前先检索相关知识，让 LLM 基于真实文档而非训练记忆回答，
            有效减少<strong style={{ color: "var(--color-text)" }}>幻觉（Hallucination）</strong>。
            选择示例问题，逐步观察从用户提问到 LLM 生成答案的完整链路。
          </p>
        </div>

        {/* 可视化主体 */}
        <RAGVisualizer />

        {/* 架构概览 */}
        <div
          className="mt-8 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>RAG 系统架构</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "离线阶段（索引构建）", color: "#3b82f6", items: ["文档切分（Chunking）", "Embedding 模型向量化", "写入向量数据库（Faiss/Pinecone）"] },
              { label: "在线阶段（查询服务）", color: "#f59e0b", items: ["用户查询向量化", "ANN 近似最近邻检索", "上下文拼接 → LLM 生成"] },
            ].map(({ label, color, items }) => (
              <div key={label} className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-surface-2)" }}>
                <div className="text-xs font-semibold mb-2" style={{ color }}>{label}</div>
                {items.map((item) => (
                  <div key={item} className="text-xs mb-1 flex items-start gap-1" style={{ color: "var(--color-text-muted)" }}>
                    <span>·</span><span>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 延伸学习 */}
        <div
          className="mt-4 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 9 章《RAG 与 Agent 应用》，了解 RAG 变体（HyDE、多路召回）和 Agent 工具调用</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>Reranker</strong>：在向量检索后用交叉编码器精排，进一步提升召回精度</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>GraphRAG</strong>：微软提出的知识图谱增强 RAG，适合需要多跳推理的场景</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

// ─── 数据定义 ──────────────────────────────────────────────────────────────────
interface Document {
  id: string;
  title: string;
  snippet: string;
  embedding: number[]; // 2D 简化向量用于可视化
  similarity?: number;
}

interface RAGQuery {
  id: string;
  question: string;
  queryVec: number[]; // 2D
  answer: string;
  relevantDocs: string[]; // doc ids
}

const DOCUMENTS: Document[] = [
  {
    id: "d1",
    title: "Transformer 架构",
    snippet: "Transformer 使用自注意力机制替代 RNN，通过 Q/K/V 矩阵并行处理序列...",
    embedding: [0.82, 0.71],
  },
  {
    id: "d2",
    title: "RLHF 训练方法",
    snippet: "RLHF 通过人类反馈的强化学习对齐模型行为，包含 SFT、奖励建模、PPO 三阶段...",
    embedding: [0.21, 0.85],
  },
  {
    id: "d3",
    title: "向量数据库原理",
    snippet: "向量数据库使用 HNSW、IVF 等近似最近邻算法，支持高效语义相似度检索...",
    embedding: [0.65, 0.38],
  },
  {
    id: "d4",
    title: "大模型微调技术",
    snippet: "LoRA 通过低秩矩阵分解大幅减少微调参数量，QLoRA 进一步引入量化降低显存...",
    embedding: [0.35, 0.62],
  },
  {
    id: "d5",
    title: "注意力机制变体",
    snippet: "多头注意力、稀疏注意力、线性注意力、Flash Attention 等提升效率的变体...",
    embedding: [0.78, 0.55],
  },
  {
    id: "d6",
    title: "推理优化方法",
    snippet: "KV Cache、投机解码、模型量化（INT8/INT4）显著加速大模型推理速度...",
    embedding: [0.48, 0.22],
  },
];

const QUERIES: RAGQuery[] = [
  {
    id: "q1",
    question: "Transformer 的注意力机制是如何工作的？",
    queryVec: [0.80, 0.68],
    answer:
      "Transformer 使用自注意力机制，通过 Query、Key、Value 三个矩阵计算各 Token 间的相关性。具体来说，每个词生成 Q/K/V 向量，Q 与所有 K 做点积并经过 softmax 得到注意力权重，再对 V 加权求和得到新的表示。多个注意力头并行运行，分别捕捉不同类型的依存关系。",
    relevantDocs: ["d1", "d5"],
  },
  {
    id: "q2",
    question: "如何高效部署大语言模型？",
    queryVec: [0.50, 0.28],
    answer:
      "高效部署大模型可从多个维度优化：① KV Cache 缓存历史 Key/Value，避免重复计算；② 模型量化（INT8/INT4）降低显存占用和推理延迟；③ 投机解码利用小模型草稿加速生成；④ 批处理（Batching）提升 GPU 吞吐量。实际生产通常结合多种方法。",
    relevantDocs: ["d6", "d3"],
  },
  {
    id: "q3",
    question: "RAG 中向量数据库如何检索相关文档？",
    queryVec: [0.63, 0.40],
    answer:
      "RAG 检索流程：① 将知识库文档切分为 Chunk 并通过 Embedding 模型转换为向量；② 存入支持向量索引的数据库（如 Faiss、Pinecone）；③ 用户查询同样向量化；④ 计算查询向量与所有文档向量的余弦相似度；⑤ 返回 Top-K 最相关文档作为上下文喂给 LLM 生成答案。",
    relevantDocs: ["d3", "d1"],
  },
];

// 余弦相似度（2D 简化版）
function cosineSim(a: number[], b: number[]): number {
  const dot = a[0] * b[0] + a[1] * b[1];
  const na = Math.sqrt(a[0] ** 2 + a[1] ** 2);
  const nb = Math.sqrt(b[0] ** 2 + b[1] ** 2);
  return dot / (na * nb);
}

type Step = "query" | "embed" | "retrieve" | "augment" | "generate";

const STEPS: { id: Step; label: string }[] = [
  { id: "query", label: "1. 用户提问" },
  { id: "embed", label: "2. 向量化" },
  { id: "retrieve", label: "3. 相似度检索" },
  { id: "augment", label: "4. 上下文增强" },
  { id: "generate", label: "5. LLM 生成" },
];

// ─── 向量空间图 ───────────────────────────────────────────────────────────────
const VIS_W = 360;
const VIS_H = 260;
const PAD = 30;

function vecToSvg(v: number[]): { x: number; y: number } {
  return {
    x: PAD + v[0] * (VIS_W - PAD * 2),
    y: VIS_H - PAD - v[1] * (VIS_H - PAD * 2),
  };
}

function VectorSpace({
  queryVec,
  docs,
  showQuery,
  showSim,
  relevantDocs,
}: {
  queryVec: number[];
  docs: Document[];
  showQuery: boolean;
  showSim: boolean;
  relevantDocs: string[];
}) {
  const q = vecToSvg(queryVec);

  return (
    <svg width={VIS_W} height={VIS_H} style={{ display: "block", margin: "0 auto" }}>
      {/* 网格 */}
      {[0.25, 0.5, 0.75].map((v) => (
        <g key={v}>
          <line
            x1={PAD + v * (VIS_W - PAD * 2)} y1={PAD}
            x2={PAD + v * (VIS_W - PAD * 2)} y2={VIS_H - PAD}
            stroke="rgba(255,255,255,0.05)" strokeWidth={1}
          />
          <line
            x1={PAD} y1={VIS_H - PAD - v * (VIS_H - PAD * 2)}
            x2={VIS_W - PAD} y2={VIS_H - PAD - v * (VIS_H - PAD * 2)}
            stroke="rgba(255,255,255,0.05)" strokeWidth={1}
          />
        </g>
      ))}
      {/* 坐标轴 */}
      <line x1={PAD} y1={VIS_H - PAD} x2={VIS_W - PAD} y2={VIS_H - PAD} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      <line x1={PAD} y1={PAD} x2={PAD} y2={VIS_H - PAD} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      <text x={VIS_W - PAD} y={VIS_H - PAD + 14} textAnchor="end" style={{ fontSize: "0.55rem", fill: "var(--color-text-muted)" }}>dim₁</text>
      <text x={PAD - 4} y={PAD} textAnchor="end" style={{ fontSize: "0.55rem", fill: "var(--color-text-muted)" }}>dim₂</text>

      {/* 相似度连线 */}
      {showSim && docs.map((doc) => {
        const pos = vecToSvg(doc.embedding);
        const isRelevant = relevantDocs.includes(doc.id);
        return (
          <line
            key={`line-${doc.id}`}
            x1={q.x} y1={q.y} x2={pos.x} y2={pos.y}
            stroke={isRelevant ? "rgba(124,109,250,0.5)" : "rgba(255,255,255,0.06)"}
            strokeWidth={isRelevant ? 1.5 : 1}
            strokeDasharray={isRelevant ? "none" : "4,3"}
          />
        );
      })}

      {/* 文档点 */}
      {docs.map((doc) => {
        const pos = vecToSvg(doc.embedding);
        const sim = showSim ? cosineSim(queryVec, doc.embedding) : 0;
        const isRelevant = relevantDocs.includes(doc.id);
        return (
          <g key={doc.id}>
            <circle
              cx={pos.x} cy={pos.y} r={isRelevant && showSim ? 8 : 6}
              fill={showSim && isRelevant ? "rgba(124,109,250,0.8)" : "rgba(124,109,250,0.25)"}
              stroke={showSim && isRelevant ? "var(--color-accent)" : "rgba(124,109,250,0.4)"}
              strokeWidth={1.5}
              style={{ transition: "all 0.4s" }}
            />
            <text x={pos.x + 10} y={pos.y + 4} style={{ fontSize: "0.6rem", fill: isRelevant && showSim ? "var(--color-text)" : "var(--color-text-muted)" }}>
              {doc.title}
            </text>
            {showSim && (
              <text x={pos.x + 10} y={pos.y + 15} style={{ fontSize: "0.55rem", fill: isRelevant ? "var(--color-accent)" : "var(--color-text-muted)", fontFamily: "monospace" }}>
                {sim.toFixed(3)}
              </text>
            )}
          </g>
        );
      })}

      {/* 查询向量 */}
      {showQuery && (
        <g>
          <circle cx={q.x} cy={q.y} r={9}
            fill="rgba(249,115,22,0.85)"
            stroke="rgba(249,115,22,1)"
            strokeWidth={2}
          />
          <text x={q.x + 12} y={q.y + 4} style={{ fontSize: "0.65rem", fill: "rgba(249,115,22,0.9)", fontWeight: 700 }}>查询</text>
        </g>
      )}
    </svg>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function RAGVisualizer() {
  const [queryIdx, setQueryIdx] = useState(0);
  const [step, setStep] = useState<Step>("query");

  const query = QUERIES[queryIdx];
  const stepIdx = STEPS.findIndex((s) => s.id === step);

  // 计算相似度并排序
  const docsWithSim = DOCUMENTS.map((doc) => ({
    ...doc,
    similarity: cosineSim(query.queryVec, doc.embedding),
  })).sort((a, b) => b.similarity - a.similarity);

  const topDocs = docsWithSim.slice(0, 2);

  function switchQuery(idx: number) {
    setQueryIdx(idx);
    setStep("query");
  }

  const showQuery = ["embed", "retrieve", "augment", "generate"].includes(step);
  const showSim = ["retrieve", "augment", "generate"].includes(step);
  const showContext = ["augment", "generate"].includes(step);
  const showAnswer = step === "generate";

  return (
    <div className="space-y-6">
      {/* 示例问题选择 */}
      <div>
        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>选择示例问题：</p>
        <div className="flex flex-wrap gap-2">
          {QUERIES.map((q, i) => (
            <button
              key={q.id}
              onClick={() => switchQuery(i)}
              className="px-4 py-2 rounded-lg text-sm transition-all cursor-pointer text-left"
              style={{
                backgroundColor: queryIdx === i ? "var(--color-accent)" : "var(--color-surface-2)",
                color: queryIdx === i ? "white" : "var(--color-text-muted)",
                border: `1px solid ${queryIdx === i ? "var(--color-accent)" : "var(--color-border)"}`,
                maxWidth: "100%",
              }}
            >
              {q.question}
            </button>
          ))}
        </div>
      </div>

      {/* 步骤导航 */}
      <div>
        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>流程步骤：</p>
        <div className="flex flex-wrap gap-2 items-center">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <button
                onClick={() => setStep(s.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                style={{
                  backgroundColor: step === s.id ? "rgba(249,115,22,0.2)" : "var(--color-surface-2)",
                  color: step === s.id ? "rgba(249,115,22,1)" : stepIdx > i ? "var(--color-text-muted)" : "var(--color-text-muted)",
                  border: `1px solid ${step === s.id ? "rgba(249,115,22,0.6)" : "var(--color-border)"}`,
                  opacity: stepIdx >= i ? 1 : 0.5,
                }}
              >
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <span style={{ color: "var(--color-border)", fontSize: "0.75rem" }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 主内容区：左右布局 */}
      <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* 向量空间图 */}
        <div
          className="p-4 rounded-xl border"
          style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
        >
          <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
            2D 向量空间（简化示意）·
            <span style={{ color: "rgba(249,115,22,0.9)", marginLeft: 4 }}>● 查询</span>
            <span style={{ color: "var(--color-accent)", marginLeft: 8 }}>● 相关文档</span>
          </p>
          <VectorSpace
            queryVec={query.queryVec}
            docs={DOCUMENTS}
            showQuery={showQuery}
            showSim={showSim}
            relevantDocs={query.relevantDocs}
          />
        </div>

        {/* 右侧：步骤详情 */}
        <div className="space-y-3">
          {/* 当前步骤卡片 */}
          <div
            className="p-4 rounded-xl border"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <StepDetail step={step} query={query} topDocs={topDocs} showContext={showContext} showAnswer={showAnswer} />
          </div>

          {/* 检索结果 */}
          {showSim && (
            <div>
              <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>相似度排名 Top-2：</p>
              {topDocs.map((doc, i) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg mb-2"
                  style={{
                    backgroundColor: query.relevantDocs.includes(doc.id) ? "rgba(124,109,250,0.08)" : "var(--color-surface-2)",
                    border: `1px solid ${query.relevantDocs.includes(doc.id) ? "rgba(124,109,250,0.3)" : "var(--color-border)"}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: "var(--color-text)" }}>
                      #{i + 1} {doc.title}
                    </span>
                    <span className="text-xs font-mono" style={{ color: "var(--color-accent)" }}>
                      {doc.similarity!.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {doc.snippet.slice(0, 60)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 前进后退 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => stepIdx > 0 && setStep(STEPS[stepIdx - 1].id)}
          disabled={stepIdx === 0}
          className="px-4 py-2 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
        >
          ← 上一步
        </button>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{stepIdx + 1} / {STEPS.length}</span>
        <button
          onClick={() => stepIdx < STEPS.length - 1 && setStep(STEPS[stepIdx + 1].id)}
          disabled={stepIdx === STEPS.length - 1}
          className="px-4 py-2 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: stepIdx < STEPS.length - 1 ? "rgba(249,115,22,0.85)" : "var(--color-surface-2)", color: "white", border: "1px solid transparent" }}
        >
          下一步 →
        </button>
      </div>
    </div>
  );
}

// ─── 步骤说明 ──────────────────────────────────────────────────────────────────
function StepDetail({
  step,
  query,
  topDocs,
  showContext,
  showAnswer,
}: {
  step: Step;
  query: RAGQuery;
  topDocs: Document[];
  showContext: boolean;
  showAnswer: boolean;
}) {
  const map: Record<Step, { title: string; body: React.ReactNode }> = {
    query: {
      title: "用户提问",
      body: (
        <div className="space-y-2 text-sm">
          <div
            className="p-3 rounded-lg text-sm"
            style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text)" }}
          >
            「{query.question}」
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            RAG（检索增强生成）在生成答案前，先从知识库中检索相关文档，再将文档作为上下文送给 LLM，从而生成更准确、有依据的答案。
          </p>
        </div>
      ),
    },
    embed: {
      title: "Embedding 向量化",
      body: (
        <div className="space-y-2 text-sm">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Embedding 模型将查询文本转换为高维向量（实际通常是 1536 维），这里简化为 2D 用于可视化。
          </p>
          <div className="font-mono text-xs p-2 rounded" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent-2)" }}>
            query_vec = embed(&quot;{query.question.slice(0, 20)}...&quot;)<br />
            → [{query.queryVec[0].toFixed(2)}, {query.queryVec[1].toFixed(2)}, ...]
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            知识库中的文档在离线阶段已全部 Embedding，存入向量数据库（橙色点为查询向量）。
          </p>
        </div>
      ),
    },
    retrieve: {
      title: "相似度检索",
      body: (
        <div className="space-y-2 text-sm">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            计算查询向量与所有文档向量的余弦相似度，返回 Top-K 最相关结果：
          </p>
          <div className="font-mono text-xs p-2 rounded" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent-2)" }}>
            sim = cos(q, d) = q·d / (‖q‖·‖d‖)
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            向量空间中距离查询点（橙色）越近的文档相似度越高（高亮显示）。
          </p>
        </div>
      ),
    },
    augment: {
      title: "上下文增强（Augmentation）",
      body: (
        <div className="space-y-2 text-sm">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            将检索到的 Top-2 文档内容拼接到提示词中：
          </p>
          <div className="font-mono text-xs p-2 rounded leading-relaxed" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent-2)" }}>
            [上下文]<br />
            {topDocs[0]?.title}: {topDocs[0]?.snippet.slice(0, 40)}...<br />
            {topDocs[1]?.title}: {topDocs[1]?.snippet.slice(0, 40)}...<br />
            <br />
            [问题] {query.question}
          </div>
        </div>
      ),
    },
    generate: {
      title: "LLM 生成答案",
      body: (
        <div className="space-y-2 text-sm">
          {showAnswer && (
            <div className="p-3 rounded-lg text-xs leading-relaxed" style={{ backgroundColor: "rgba(86,212,179,0.06)", border: "1px solid rgba(86,212,179,0.2)", color: "var(--color-text)" }}>
              {query.answer}
            </div>
          )}
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            LLM 基于增强上下文生成有依据的答案，而非依赖训练时记忆的知识，有效减少幻觉。
          </p>
        </div>
      ),
    },
  };

  const { title, body } = map[step];
  return (
    <div>
      <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>{title}</h3>
      {body}
    </div>
  );
}

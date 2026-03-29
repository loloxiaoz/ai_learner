"use client";

import { useState } from "react";

// ─── 数据流步骤定义 ────────────────────────────────────────────────────────────
interface FlowStep {
  id: string;
  layer: string;
  dim: string;
  color: string;
  desc: string;
  formula: string;
  detail: string;
}

const STEPS: FlowStep[] = [
  {
    id: "input",
    layer: "输入 Token",
    dim: "vocabulary size",
    color: "#60a5fa",
    desc: "一个 one-hot 向量，维度等于词表大小（如 50,000）",
    formula: "x ∈ ℤ  (token id)",
    detail: "「The」→ token_id = 1234",
  },
  {
    id: "embed",
    layer: "Token Embedding",
    dim: "d_model = 512",
    color: "#818cf8",
    desc: "通过 Embedding 矩阵 W_E ∈ ℝ^{V×d} 将 token id 映射为稠密向量",
    formula: "e = W_E[x] ∈ ℝ^{d}",
    detail: "one-hot 转为 512 维稠密向量",
  },
  {
    id: "pe",
    layer: "+ 位置编码",
    dim: "d_model = 512",
    color: "#a78bfa",
    desc: "将 sin/cos 位置编码与 Token 向量相加，注入位置信息",
    formula: "z = e + PE(pos)",
    detail: "第 0 个 token 与第 5 个 token 的 PE 不同",
  },
  {
    id: "attn",
    layer: "多头自注意力",
    dim: "d_model = 512",
    color: "#f472b6",
    desc: "投影生成 Q/K/V，并行计算 8 个注意力头，拼接后线性变换",
    formula: "Attn = softmax(QKᵀ/√d_k)V",
    detail: "8 头 × 64 维 = 512 维，捕捉不同依存关系",
  },
  {
    id: "add1",
    layer: "残差连接 + LayerNorm",
    dim: "d_model = 512",
    color: "#fb923c",
    desc: "将注意力输出与输入相加（残差），再做层归一化稳定训练",
    formula: "z₁ = LayerNorm(z + Attn(z))",
    detail: "残差连接防止梯度消失，LayerNorm 稳定激活分布",
  },
  {
    id: "ffn",
    layer: "前馈网络（FFN）",
    dim: "d_ff = 2048",
    color: "#34d399",
    desc: "两层线性变换，中间维度扩展 4 倍（512→2048→512），激活函数 GELU",
    formula: "FFN(x) = GELU(xW₁+b₁)W₂+b₂",
    detail: "FFN 参数量占 Transformer 的 2/3，主要存储知识",
  },
  {
    id: "add2",
    layer: "残差连接 + LayerNorm",
    dim: "d_model = 512",
    color: "#fb923c",
    desc: "再次残差连接与归一化，完成一个完整的 Transformer Block",
    formula: "z₂ = LayerNorm(z₁ + FFN(z₁))",
    detail: "GPT-2 有 12 层，GPT-3 有 96 层，每层重复此结构",
  },
  {
    id: "output",
    layer: "输出 Logits → Softmax",
    dim: "vocabulary size",
    color: "#fbbf24",
    desc: "通过 LM Head 将 d_model 映射回词表大小，softmax 得到下一个 token 的概率分布",
    formula: "P(next) = softmax(z₂ · W_E^T)",
    detail: "与 Embedding 权重共享（Weight Tying），参数量减半",
  },
];

const BOX_W = 180, BOX_H = 40, SVG_W = 380;
const BOX_X = (SVG_W - BOX_W) / 2;
const STEP_H = BOX_H + 20;

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function TransformerFlowVisualizer() {
  const [activeStep, setActiveStep] = useState(0);
  const [highlightFlow, setHighlightFlow] = useState(false);

  const step = STEPS[activeStep];

  // 数据流可视化：每层的维度
  const dims = [50000, 512, 512, 512, 512, 2048, 512, 50000];
  const maxDim = 50000;

  return (
    <div className="space-y-4">
      {/* 控制 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setHighlightFlow(!highlightFlow)}
          className="px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-all"
          style={{ backgroundColor: highlightFlow ? "rgba(52,211,153,0.15)" : "var(--color-surface-2)", color: highlightFlow ? "rgba(52,211,153,0.9)" : "var(--color-text-muted)", border: `1px solid ${highlightFlow ? "rgba(52,211,153,0.4)" : "var(--color-border)"}` }}
        >
          {highlightFlow ? "● 显示维度变化" : "○ 显示维度变化"}
        </button>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>点击层级查看详情</span>
      </div>

      {/* 两栏布局 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
        {/* 架构图 */}
        <div
          className="p-3 rounded-xl border overflow-y-auto"
          style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)", maxHeight: 520 }}
        >
          <svg width={SVG_W} height={STEPS.length * STEP_H + 20} style={{ display: "block" }}>
            {STEPS.map((s, i) => {
              const y = 10 + i * STEP_H;
              const isActive = activeStep === i;
              const isPast = activeStep > i;
              // 维度条宽度
              const dimW = highlightFlow ? (dims[i] === 50000 ? BOX_W * 0.9 : (dims[i] / 2048) * BOX_W * 0.7 + BOX_W * 0.2) : 0;

              return (
                <g key={s.id} style={{ cursor: "pointer" }} onClick={() => setActiveStep(i)}>
                  {/* 连接线 */}
                  {i > 0 && (
                    <line
                      x1={SVG_W / 2} y1={y - 20}
                      x2={SVG_W / 2} y2={y}
                      stroke={isPast || isActive ? s.color : "rgba(0,0,0,0.1)"}
                      strokeWidth={2}
                      strokeDasharray={isPast ? "none" : "4,3"}
                    />
                  )}
                  {/* 维度条（背景） */}
                  {highlightFlow && (
                    <rect
                      x={BOX_X + (BOX_W - dimW) / 2} y={y + 2}
                      width={dimW} height={BOX_H - 4}
                      rx={6}
                      fill={s.color.replace(")", ",0.08)").replace("rgb", "rgba")}
                    />
                  )}
                  {/* 主框 */}
                  <rect
                    x={BOX_X} y={y}
                    width={BOX_W} height={BOX_H}
                    rx={8}
                    fill={isActive ? s.color + "22" : "rgba(0,0,0,0.02)"}
                    stroke={isActive ? s.color : isPast ? s.color + "66" : "rgba(0,0,0,0.1)"}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  {/* 层名称 */}
                  <text
                    x={SVG_W / 2} y={y + BOX_H / 2 - 3}
                    textAnchor="middle"
                    style={{ fontSize: "0.65rem", fill: isActive ? "white" : isPast ? "var(--color-text)" : "var(--color-text-muted)", fontWeight: isActive ? 700 : 400 }}
                  >
                    {s.layer}
                  </text>
                  {/* 维度标注 */}
                  <text
                    x={SVG_W / 2} y={y + BOX_H / 2 + 10}
                    textAnchor="middle"
                    style={{ fontSize: "0.5rem", fill: isActive ? s.color : "var(--color-text-muted)", fontFamily: "monospace" }}
                  >
                    [{s.dim}]
                  </text>
                  {/* 数字步骤 */}
                  <circle cx={BOX_X - 14} cy={y + BOX_H / 2} r={9} fill={isActive ? s.color : "rgba(0,0,0,0.05)"} />
                  <text x={BOX_X - 14} y={y + BOX_H / 2 + 4} textAnchor="middle" style={{ fontSize: "0.55rem", fill: isActive ? "white" : "var(--color-text-muted)" }}>{i + 1}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 详情卡片 */}
        <div className="space-y-3">
          <div
            className="p-4 rounded-xl border"
            style={{ backgroundColor: step.color + "11", borderColor: step.color + "44" }}
          >
            <div className="text-xs mb-1" style={{ color: step.color }}>步骤 {activeStep + 1}/{STEPS.length}</div>
            <div className="font-bold text-base mb-2" style={{ color: "var(--color-text)" }}>{step.layer}</div>
            <div
              className="font-mono text-xs p-2 rounded mb-3"
              style={{ backgroundColor: "var(--color-surface-2)", color: step.color }}
            >
              {step.formula}
            </div>
            <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--color-text-muted)" }}>
              {step.desc}
            </p>
            <div
              className="text-xs px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(0,0,0,0.03)", color: "var(--color-text-muted)", borderLeft: `3px solid ${step.color}` }}
            >
              {step.detail}
            </div>
          </div>

          {/* 维度流 */}
          <div
            className="p-3 rounded-xl border"
            style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
          >
            <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>维度变化流（当前层高亮）</p>
            <div className="space-y-1">
              {STEPS.map((s, i) => {
                const isActive = i === activeStep;
                const barW = dims[i] === 50000 ? 90 : Math.round((dims[i] / 2048) * 60) + 10;
                return (
                  <div key={s.id} className="flex items-center gap-2" style={{ cursor: "pointer" }} onClick={() => setActiveStep(i)}>
                    <span className="text-xs w-32 text-right" style={{ color: isActive ? s.color : "var(--color-text-muted)", fontWeight: isActive ? 600 : 400 }}>
                      {s.layer.length > 10 ? s.layer.slice(0, 10) + "…" : s.layer}
                    </span>
                    <div className="flex-1 h-3 rounded" style={{ backgroundColor: "var(--color-surface)" }}>
                      <div
                        className="h-3 rounded transition-all"
                        style={{ width: `${barW}%`, backgroundColor: isActive ? s.color : s.color + "44" }}
                      />
                    </div>
                    <span className="text-xs font-mono w-16" style={{ color: isActive ? s.color : "var(--color-text-muted)" }}>
                      {dims[i].toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 前后导航 */}
          <div className="flex gap-2">
            <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}
              className="flex-1 py-2 rounded-lg text-xs cursor-pointer disabled:opacity-30 transition-all"
              style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
            >← 上一层</button>
            <button onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))} disabled={activeStep === STEPS.length - 1}
              className="flex-1 py-2 rounded-lg text-xs cursor-pointer disabled:opacity-30 transition-all"
              style={{ backgroundColor: step.color + "cc", color: "white", border: "1px solid transparent" }}
            >下一层 →</button>
          </div>
        </div>
      </div>

      {/* 总体说明 */}
      <div className="p-4 rounded-xl border text-xs leading-relaxed space-y-2" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
        <p>
          <strong style={{ color: "var(--color-text)" }}>Transformer Block 的两大核心：</strong>
          自注意力（建立 token 间依存关系）+ FFN（存储模型知识），通过残差连接和 LayerNorm 串联。N 个 Block 堆叠构成完整模型。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>参数量分布：</strong>
          以 GPT-2 (117M) 为例，Embedding 占 ~38M，每个 Block 中 Attention 占 2.4M、FFN 占 4.7M。FFN 是主要的知识存储层。
        </p>
      </div>
    </div>
  );
}

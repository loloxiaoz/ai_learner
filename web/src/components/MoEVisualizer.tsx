"use client";

import { useState } from "react";

// ─── 专家定义 ──────────────────────────────────────────────────────────────────
interface Expert {
  id: number;
  name: string;
  specialty: string;
  color: string;
}

const EXPERTS: Expert[] = [
  { id: 0, name: "Expert 0", specialty: "语法/结构词",   color: "#60a5fa" },
  { id: 1, name: "Expert 1", specialty: "代码/编程",     color: "#34d399" },
  { id: 2, name: "Expert 2", specialty: "数学/推理",     color: "#fbbf24" },
  { id: 3, name: "Expert 3", specialty: "实体/名词",     color: "#f472b6" },
  { id: 4, name: "Expert 4", specialty: "情感/语气",     color: "#fb923c" },
  { id: 5, name: "Expert 5", specialty: "多语言",        color: "#a78bfa" },
  { id: 6, name: "Expert 6", specialty: "事实/知识",     color: "#2dd4bf" },
  { id: 7, name: "Expert 7", specialty: "创意/生成",     color: "#e879f9" },
];

// ─── 示例 token 及路由 ────────────────────────────────────────────────────────
interface TokenExample {
  token: string;
  context: string;
  topExperts: number[];  // top-2 专家 id
  scores: number[];      // 路由分数 (softmax)
  reason: string;
}

const TOKEN_EXAMPLES: TokenExample[] = [
  {
    token: "def",
    context: "def forward(self):",
    topExperts: [1, 0],
    scores: [0.0, 0.68, 0.04, 0.02, 0.01, 0.01, 0.03, 0.01],
    // scores after normalization for top-2
    reason: "代码关键字 'def' 主要激活编程专家（Expert 1）和语法专家（Expert 0）",
  },
  {
    token: "gradient",
    context: "the gradient of loss",
    topExperts: [2, 6],
    scores: [0.01, 0.02, 0.55, 0.01, 0.01, 0.01, 0.38, 0.01],
    reason: "数学术语「gradient」激活数学推理专家（Expert 2）和知识专家（Expert 6）",
  },
  {
    token: "beautiful",
    context: "what a beautiful day",
    topExperts: [4, 7],
    scores: [0.01, 0.01, 0.01, 0.02, 0.45, 0.01, 0.02, 0.47],
    reason: "情感词「beautiful」激活情感语气专家（Expert 4）和创意生成专家（Expert 7）",
  },
  {
    token: "北京",
    context: "北京是中国首都",
    topExperts: [5, 6],
    scores: [0.01, 0.01, 0.02, 0.03, 0.01, 0.52, 0.39, 0.01],
    reason: "中文地名「北京」激活多语言专家（Expert 5）和事实知识专家（Expert 6）",
  },
  {
    token: "the",
    context: "the quick brown fox",
    topExperts: [0, 4],
    scores: [0.71, 0.02, 0.01, 0.02, 0.18, 0.01, 0.03, 0.02],
    reason: "高频冠词「the」主要激活语法结构专家（Expert 0），情感语气专家（Expert 4）有少量参与",
  },
  {
    token: "∫",
    context: "∫f(x)dx = F(x)",
    topExperts: [2, 5],
    scores: [0.01, 0.01, 0.62, 0.01, 0.01, 0.28, 0.05, 0.01],
    reason: "积分符号「∫」强烈激活数学推理专家（Expert 2），多语言专家（Expert 5）处理特殊符号",
  },
];

// ─── SVG 布局 ─────────────────────────────────────────────────────────────────
const EXP_W = 88, EXP_H = 50, EXP_GAP_X = 12, EXP_GAP_Y = 14;
const COLS = 4, ROWS = 2;
const SVG_W = COLS * EXP_W + (COLS - 1) * EXP_GAP_X + 60;
const SVG_H = 180;
const EXP_START_Y = 20;
const ROUTER_Y = SVG_H - 30;

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function MoEVisualizer() {
  const [tokenIdx, setTokenIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const ex = TOKEN_EXAMPLES[tokenIdx];

  // 计算专家位置
  function expertPos(id: number) {
    const col = id % COLS;
    const row = Math.floor(id / COLS);
    const totalW = COLS * EXP_W + (COLS - 1) * EXP_GAP_X;
    const startX = (SVG_W - totalW) / 2;
    return {
      x: startX + col * (EXP_W + EXP_GAP_X),
      y: EXP_START_Y + row * (EXP_H + EXP_GAP_Y),
    };
  }

  const routerX = SVG_W / 2;
  const routerY = ROUTER_Y;

  return (
    <div className="space-y-4">
      {/* Token 选择 */}
      <div>
        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>选择输入 Token：</p>
        <div className="flex flex-wrap gap-2">
          {TOKEN_EXAMPLES.map((t, i) => (
            <button
              key={i}
              onClick={() => setTokenIdx(i)}
              className="px-3 py-2 rounded-lg text-xs font-mono cursor-pointer transition-all"
              style={{
                backgroundColor: tokenIdx === i ? "rgba(124,109,250,0.2)" : "var(--color-surface-2)",
                color: tokenIdx === i ? "var(--color-accent)" : "var(--color-text-muted)",
                border: `1px solid ${tokenIdx === i ? "rgba(124,109,250,0.4)" : "var(--color-border)"}`,
              }}
            >
              <span className="font-bold" style={{ fontSize: "1rem" }}>{t.token}</span>
              <span className="ml-1.5 text-xs" style={{ opacity: 0.7 }}>{t.context.slice(0, 12)}…</span>
            </button>
          ))}
        </div>
      </div>

      {/* 可视化 */}
      <div
        className="p-4 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            路由结果：仅激活 Top-2 专家（<span style={{ color: "rgba(52,211,153,0.9)" }}>绿色高亮</span>），其余 6 个专家不参与计算
          </p>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs px-3 py-1 rounded-lg cursor-pointer transition-all"
            style={{ backgroundColor: showAll ? "rgba(124,109,250,0.15)" : "var(--color-surface)", color: showAll ? "var(--color-accent)" : "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
          >
            {showAll ? "只显示激活" : "显示所有分数"}
          </button>
        </div>

        {/* SVG 路由图 */}
        <svg width={SVG_W} height={SVG_H} style={{ display: "block", margin: "0 auto" }}>
          <defs>
            <marker id="arr" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z" fill="rgba(255,255,255,0.3)" />
            </marker>
            <marker id="arrG" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z" fill="rgba(52,211,153,0.8)" />
            </marker>
          </defs>

          {/* 专家框 */}
          {EXPERTS.map((exp) => {
            const { x, y } = expertPos(exp.id);
            const isActive = ex.topExperts.includes(exp.id);
            const rank = ex.topExperts.indexOf(exp.id); // 0=top1, 1=top2
            const score = ex.scores[exp.id];
            return (
              <g key={exp.id}>
                {/* 路由连线（激活的） */}
                {isActive && (
                  <line
                    x1={routerX} y1={routerY - 10}
                    x2={x + EXP_W / 2} y2={y + EXP_H}
                    stroke={rank === 0 ? "rgba(52,211,153,0.7)" : "rgba(52,211,153,0.4)"}
                    strokeWidth={rank === 0 ? 2 : 1.5}
                    strokeDasharray="none"
                    markerEnd="url(#arrG)"
                  />
                )}
                {/* 专家框 */}
                <rect
                  x={x} y={y} width={EXP_W} height={EXP_H} rx={6}
                  fill={isActive ? exp.color + "20" : "rgba(255,255,255,0.03)"}
                  stroke={isActive ? exp.color : "rgba(255,255,255,0.08)"}
                  strokeWidth={isActive ? 2 : 1}
                />
                {/* 专家名称 */}
                <text x={x + EXP_W / 2} y={y + 14} textAnchor="middle"
                  style={{ fontSize: "0.55rem", fill: isActive ? exp.color : "var(--color-text-muted)", fontWeight: isActive ? 700 : 400 }}>
                  {exp.name}
                </text>
                <text x={x + EXP_W / 2} y={y + 26} textAnchor="middle"
                  style={{ fontSize: "0.48rem", fill: isActive ? "var(--color-text)" : "var(--color-text-muted)" }}>
                  {exp.specialty}
                </text>
                {/* 分数 */}
                {(isActive || showAll) && (
                  <text x={x + EXP_W / 2} y={y + 40} textAnchor="middle"
                    style={{ fontSize: "0.5rem", fill: isActive ? exp.color : "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>
                    {(score * 100).toFixed(0)}%{isActive ? (rank === 0 ? " ★" : " ✓") : ""}
                  </text>
                )}
              </g>
            );
          })}

          {/* 路由器 */}
          <rect
            x={routerX - 50} y={routerY - 12} width={100} height={24} rx={12}
            fill="rgba(124,109,250,0.2)" stroke="rgba(124,109,250,0.6)" strokeWidth={1.5}
          />
          <text x={routerX} y={routerY + 4} textAnchor="middle"
            style={{ fontSize: "0.6rem", fill: "var(--color-accent)", fontWeight: 700 }}>
            Router（门控网络）
          </text>

          {/* 输入 token → 路由器 */}
          <text x={routerX} y={routerY + 22} textAnchor="middle"
            style={{ fontSize: "0.65rem", fill: "rgba(249,115,22,0.9)", fontWeight: 700 }}>
            ↑ 「{ex.token}」
          </text>
        </svg>
      </div>

      {/* 路由说明 */}
      <div className="p-3 rounded-xl border text-xs" style={{ backgroundColor: "rgba(52,211,153,0.06)", borderColor: "rgba(52,211,153,0.25)" }}>
        <div className="flex gap-3 mb-2">
          {ex.topExperts.map((eid, rank) => (
            <div key={eid} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EXPERTS[eid].color }} />
              <span style={{ color: EXPERTS[eid].color }}>
                {rank === 0 ? "Top-1" : "Top-2"}: {EXPERTS[eid].name}（{EXPERTS[eid].specialty}）
                <span className="ml-1 font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {(ex.scores[eid] * 100).toFixed(0)}%
                </span>
              </span>
            </div>
          ))}
        </div>
        <p style={{ color: "var(--color-text-muted)" }}>{ex.reason}</p>
      </div>

      {/* 稀疏 vs 密集对比 */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            title: "Dense（传统 FFN）",
            color: "#f87171",
            desc: "每个 token 都经过所有参数计算",
            activated: 8,
            total: 8,
            params: "7B（全部激活）",
          },
          {
            title: "Sparse MoE（如 Mixtral）",
            color: "rgba(52,211,153,0.9)",
            desc: "每个 token 只激活 Top-2 专家",
            activated: 2,
            total: 8,
            params: "7B×8=56B，但每次只用 14B",
          },
        ].map(({ title, color, desc, activated, total, params }) => (
          <div key={title} className="p-3 rounded-xl border text-xs" style={{ backgroundColor: "var(--color-surface-2)", border: `1px solid ${color}33` }}>
            <div className="font-semibold mb-1" style={{ color }}>{title}</div>
            <p className="mb-2" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
            <div className="flex gap-1 mb-1">
              {Array.from({ length: total }, (_, i) => (
                <div key={i} className="flex-1 h-3 rounded" style={{ backgroundColor: i < activated ? color : "rgba(255,255,255,0.08)" }} />
              ))}
            </div>
            <div className="font-mono mt-1" style={{ color }}>激活 {activated}/{total} 专家</div>
            <div style={{ color: "var(--color-text-muted)" }}>{params}</div>
          </div>
        ))}
      </div>

      {/* 说明 */}
      <div className="p-4 rounded-xl border text-xs leading-relaxed space-y-2" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
        <p>
          <strong style={{ color: "var(--color-text)" }}>MoE 的核心优势：</strong>
          参数量可扩展到 Dense 模型的 N 倍（N=专家数），但每个 token 的推理计算量不变——Mixtral 8×7B 拥有 56B 参数，但每次推理只激活约 14B 参数，速度与 7B 相当。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>路由崩溃（Router Collapse）：</strong>
          训练不稳定时路由器可能总选同几个专家，其他专家永远学不到。辅助负载均衡损失（Auxiliary Load Balance Loss）强制所有专家均匀被使用。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>代表模型：</strong>
          Mixtral 8×7B、DeepSeek-MoE、GPT-4（疑似 MoE）、Switch Transformer。
        </p>
      </div>
    </div>
  );
}

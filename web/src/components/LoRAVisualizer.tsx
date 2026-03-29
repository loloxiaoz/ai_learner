"use client";

import { useState, useMemo } from "react";

// ─── 矩阵尺寸与数据 ────────────────────────────────────────────────────────────
const D = 10; // d×d 权重矩阵，10×10 用于可视化

// 用固定种子生成伪随机矩阵（确保服务端/客户端一致）
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff) * 2 - 1;
  };
}

function makeMatrix(seed: number): number[][] {
  const rand = seededRand(seed);
  return Array.from({ length: D }, () => Array.from({ length: D }, () => rand() * 0.8));
}

// 原始权重矩阵 W（模拟预训练权重）
const W0 = makeMatrix(42);

// 低秩矩阵 A（r×d），B（d×r）
function makeLoRAMatrices(rank: number): { A: number[][]; B: number[][] } {
  const randA = seededRand(137 + rank);
  const randB = seededRand(259 + rank);
  const A: number[][] = Array.from({ length: rank }, () =>
    Array.from({ length: D }, () => randA() * 0.4)
  );
  const B: number[][] = Array.from({ length: D }, () =>
    Array.from({ length: rank }, () => randB() * 0.4)
  );
  return { A, B };
}

// 矩阵乘法 B×A → deltaW（d×d）
function matMul(B: number[][], A: number[][]): number[][] {
  const r = B[0].length;
  return B.map((bRow) =>
    Array.from({ length: D }, (_, j) =>
      bRow.reduce((sum, bv, k) => sum + bv * A[k][j], 0) / Math.sqrt(r)
    )
  );
}

// Frobenius 范数
function frobNorm(M: number[][]): number {
  return Math.sqrt(M.flat().reduce((s, v) => s + v * v, 0));
}

// 颜色映射：-1 → 蓝，0 → 黑，+1 → 橙
function matColor(v: number, alpha = 1): string {
  const t = Math.max(-1, Math.min(1, v));
  if (t < 0) {
    const c = Math.round(-t * 120);
    return `rgba(50,${80 + c},${200 + c * 0.3},${alpha})`;
  } else {
    const c = Math.round(t * 120);
    return `rgba(${180 + c * 0.6},${80 + c * 0.4},50,${alpha})`;
  }
}

// ─── 矩阵热图组件 ─────────────────────────────────────────────────────────────
function MatrixHeatmap({
  matrix,
  label,
  sublabel,
  maxDim,
}: {
  matrix: number[][];
  label: string;
  sublabel: string;
  maxDim?: number;
}) {
  const [hovered, setHovered] = useState<{ r: number; c: number } | null>(null);
  const rows = maxDim ? matrix.slice(0, maxDim) : matrix;
  const cols = maxDim ?? (matrix[0]?.length ?? 0);
  const cellSize = maxDim ? Math.min(18, Math.floor(140 / maxDim)) : Math.min(18, Math.floor(140 / D));
  const actualCols = Math.min(cols, maxDim ?? cols);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>{label}</div>
      <div className="text-xs font-mono" style={{ color: "var(--color-text-muted)", fontSize: "0.55rem" }}>{sublabel}</div>
      <div
        style={{ display: "inline-grid", gridTemplateColumns: `repeat(${actualCols}, ${cellSize}px)`, gap: 1 }}
        onMouseLeave={() => setHovered(null)}
      >
        {rows.map((row, ri) =>
          row.slice(0, actualCols).map((v, ci) => (
            <div
              key={`${ri}-${ci}`}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: matColor(v),
                borderRadius: 1,
                cursor: "pointer",
                outline: hovered?.r === ri && hovered?.c === ci ? "1px solid white" : "none",
              }}
              onMouseEnter={() => setHovered({ r: ri, c: ci })}
            />
          ))
        )}
      </div>
      {hovered && (
        <div className="text-xs font-mono" style={{ color: "var(--color-accent)", fontSize: "0.6rem" }}>
          [{hovered.r},{hovered.c}] = {(rows[hovered.r]?.[hovered.c] ?? 0).toFixed(3)}
        </div>
      )}
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function LoRAVisualizer() {
  const [rank, setRank] = useState(2);
  const [showDelta, setShowDelta] = useState(false);

  const { A, B } = useMemo(() => makeLoRAMatrices(rank), [rank]);
  const deltaW = useMemo(() => matMul(B, A), [B, A]);
  const W_merged = useMemo(
    () => W0.map((row, i) => row.map((v, j) => v + deltaW[i][j])),
    [deltaW]
  );

  // 参数量
  const fullParams = D * D; // 100
  const loraParams = D * rank * 2; // d*r + r*d
  const ratio = ((loraParams / fullParams) * 100).toFixed(1);
  const saved = (((fullParams - loraParams) / fullParams) * 100).toFixed(1);

  // 误差（模拟：rank 越高越接近全参微调）
  const deltaNorm = frobNorm(deltaW);

  return (
    <div className="space-y-5">
      {/* Rank 滑块 */}
      <div
        className="p-4 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            秩 r（Rank）
          </span>
          <span
            className="text-xl font-bold font-mono"
            style={{ color: "var(--color-accent)" }}
          >
            {rank}
          </span>
        </div>
        <input
          type="range" min={1} max={D} step={1} value={rank}
          onChange={(e) => setRank(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          <span>r=1（最低秩）</span>
          <span>r={D}（等于全秩，退化为全参微调）</span>
        </div>
      </div>

      {/* 参数量对比 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "全参微调参数量", value: `${fullParams}`, sub: `d×d = ${D}×${D}`, color: "#f87171" },
          { label: "LoRA 参数量", value: `${loraParams}`, sub: `2 × d × r = 2×${D}×${rank}`, color: "var(--color-accent)" },
          { label: "参数节省", value: `${saved}%`, sub: `仅用 ${ratio}% 的参数`, color: "rgba(52,211,153,0.9)" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>{label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5 font-mono" style={{ color: "var(--color-text-muted)" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* 参数量条形对比 */}
      <div className="p-3 rounded-xl border" style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>参数量比例（可视化）</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs w-20 text-right font-mono" style={{ color: "#f87171" }}>全参微调</span>
            <div className="flex-1 h-4 rounded" style={{ backgroundColor: "#f87171", opacity: 0.7 }} />
            <span className="text-xs w-10 font-mono" style={{ color: "#f87171" }}>{fullParams}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-20 text-right font-mono" style={{ color: "var(--color-accent)" }}>LoRA (r={rank})</span>
            <div className="flex-1 h-4 rounded overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
              <div
                className="h-full rounded transition-all"
                style={{ width: `${ratio}%`, backgroundColor: "var(--color-accent)", opacity: 0.8 }}
              />
            </div>
            <span className="text-xs w-10 font-mono" style={{ color: "var(--color-accent)" }}>{loraParams}</span>
          </div>
        </div>
      </div>

      {/* 矩阵可视化 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            权重矩阵分解（{D}×{D} 示意）
          </p>
          <button
            onClick={() => setShowDelta(!showDelta)}
            className="text-xs px-3 py-1 rounded-lg transition-all cursor-pointer"
            style={{
              backgroundColor: showDelta ? "rgba(52,211,153,0.15)" : "var(--color-surface-2)",
              color: showDelta ? "rgba(52,211,153,0.9)" : "var(--color-text-muted)",
              border: `1px solid ${showDelta ? "rgba(52,211,153,0.4)" : "var(--color-border)"}`,
            }}
          >
            {showDelta ? "▼ 隐藏合并权重" : "▲ 显示 W₀+ΔW"}
          </button>
        </div>
        <div className="flex flex-wrap gap-6 justify-center items-start p-4 rounded-xl border" style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
          <MatrixHeatmap matrix={W0} label="W₀（冻结）" sublabel={`${D}×${D} = ${fullParams} params`} />
          <div className="flex flex-col items-center justify-center gap-1 mt-8">
            <span className="text-base" style={{ color: "var(--color-text-muted)" }}>+</span>
          </div>
          <MatrixHeatmap matrix={B} label="B（可训练）" sublabel={`${D}×${rank} = ${D * rank} params`} maxDim={rank} />
          <div className="flex flex-col items-center justify-center gap-1 mt-8">
            <span className="text-base" style={{ color: "var(--color-text-muted)" }}>×</span>
          </div>
          <MatrixHeatmap matrix={A} label="A（可训练）" sublabel={`${rank}×${D} = ${rank * D} params`} maxDim={rank} />
          {showDelta && (
            <>
              <div className="flex flex-col items-center justify-center gap-1 mt-8">
                <span className="text-base" style={{ color: "rgba(52,211,153,0.9)" }}>→</span>
              </div>
              <MatrixHeatmap
                matrix={W_merged}
                label="W₀ + ΔW（推理时合并）"
                sublabel={`ΔW 范数: ${deltaNorm.toFixed(3)}`}
              />
            </>
          )}
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: "var(--color-text-muted)" }}>
          颜色：<span style={{ color: "rgba(50,120,220,0.9)" }}>■ 负值</span>
          <span className="mx-2">|</span>
          <span style={{ color: "rgba(200,100,50,0.9)" }}>■ 正值</span>
          · 悬停查看具体数值
        </p>
      </div>

      {/* 原理说明 */}
      <div
        className="p-4 rounded-xl border text-xs leading-relaxed space-y-2"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <p>
          <strong style={{ color: "var(--color-text)" }}>LoRA 核心假设：</strong>
          大模型权重更新量 ΔW 是低秩的——即 ΔW = B×A，其中 rank(B×A) = r &lt;&lt; d。
          训练时冻结 W₀，只更新 B 和 A，推理时将 B×A 合并回 W₀ 不增加延迟。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>实际效果：</strong>
          LLaMA-7B 中 r=8 时 LoRA 参数仅占全参的 0.1%~0.5%，却能达到全参微调 85%~95% 的效果。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>QLoRA 进一步优化：</strong>
          将 W₀ 量化为 4-bit，只有 A、B 保持 16-bit，7B 模型可在单张 24GB 显卡上微调。
        </p>
      </div>
    </div>
  );
}

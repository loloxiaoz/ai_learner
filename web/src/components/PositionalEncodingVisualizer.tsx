"use client";

import { useState, useMemo } from "react";

// ─── PE 计算 ──────────────────────────────────────────────────────────────────
function getPE(pos: number, dim: number, dModel: number): number {
  if (dim % 2 === 0) {
    return Math.sin(pos / Math.pow(10000, dim / dModel));
  } else {
    return Math.cos(pos / Math.pow(10000, (dim - 1) / dModel));
  }
}

// ─── 颜色映射（-1 → 0 → +1 = 蓝 → 黑 → 黄）──────────────────────────────────
function peColor(v: number): string {
  const t = (v + 1) / 2; // 0..1
  if (t < 0.5) {
    const r = Math.round(t * 2 * 50);
    const g = Math.round(t * 2 * 100);
    const b = Math.round(100 + t * 2 * 155);
    return `rgb(${r},${g},${b})`;
  } else {
    const tt = (t - 0.5) * 2;
    const r = Math.round(50 + tt * 205);
    const g = Math.round(100 + tt * 130);
    const b = Math.round(255 - tt * 200);
    return `rgb(${r},${g},${b})`;
  }
}

const D_MODEL = 64;
const SEQ_LEN = 32;
const VIS_DIMS = 32; // 显示前32维

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function PositionalEncodingVisualizer() {
  const [selectedPos, setSelectedPos] = useState<number | null>(null);
  const [selectedDim, setSelectedDim] = useState<number | null>(null);
  const [mode, setMode] = useState<"heatmap" | "curve">("heatmap");

  // 预计算 PE 矩阵
  const peMatrix = useMemo(() => {
    const m: number[][] = [];
    for (let pos = 0; pos < SEQ_LEN; pos++) {
      const row: number[] = [];
      for (let dim = 0; dim < VIS_DIMS; dim++) {
        row.push(getPE(pos, dim, D_MODEL));
      }
      m.push(row);
    }
    return m;
  }, []);

  const CELL_W = 10, CELL_H = 14;
  const HM_W = VIS_DIMS * CELL_W + 80;
  const HM_H = SEQ_LEN * CELL_H + 50;

  return (
    <div className="space-y-4">
      {/* 模式切换 */}
      <div className="flex gap-2 items-center">
        {(["heatmap", "curve"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: mode === m ? "rgba(124,109,250,0.2)" : "var(--color-surface-2)",
              color: mode === m ? "var(--color-accent)" : "var(--color-text-muted)",
              border: `1px solid ${mode === m ? "rgba(124,109,250,0.5)" : "var(--color-border)"}`,
            }}
          >
            {m === "heatmap" ? "热图（整体矩阵）" : "曲线（按维度）"}
          </button>
        ))}
        <span className="text-xs ml-2" style={{ color: "var(--color-text-muted)" }}>
          d_model={D_MODEL}，显示前{VIS_DIMS}维，序列长度={SEQ_LEN}
        </span>
      </div>

      {mode === "heatmap" ? (
        <>
          <div
            className="p-3 rounded-xl border overflow-auto"
            style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)", maxHeight: 480 }}
          >
            <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>
              点击格子查看具体数值（行 = 位置 pos，列 = 维度 dim）
            </p>
            <svg width={HM_W} height={HM_H} style={{ display: "block" }}>
              {/* 维度轴标签 */}
              {[0, 8, 16, 24, 31].map((d) => (
                <text
                  key={d}
                  x={60 + d * CELL_W + CELL_W / 2}
                  y={14}
                  textAnchor="middle"
                  style={{ fontSize: "0.5rem", fill: "var(--color-text-muted)" }}
                >
                  {d}
                </text>
              ))}
              <text x={60 + VIS_DIMS * CELL_W / 2} y={28} textAnchor="middle" style={{ fontSize: "0.5rem", fill: "var(--color-text-muted)" }}>维度 (dim)</text>

              {peMatrix.map((row, pos) => (
                <g key={pos}>
                  {/* 位置标签 */}
                  <text
                    x={52}
                    y={38 + pos * CELL_H + CELL_H / 2 + 3}
                    textAnchor="end"
                    style={{ fontSize: "0.5rem", fill: pos % 4 === 0 ? "var(--color-text-muted)" : "transparent" }}
                  >
                    {pos}
                  </text>
                  {row.map((v, dim) => (
                    <rect
                      key={dim}
                      x={60 + dim * CELL_W}
                      y={38 + pos * CELL_H}
                      width={CELL_W - 0.5}
                      height={CELL_H - 0.5}
                      fill={peColor(v)}
                      opacity={selectedPos === pos || selectedDim === dim ? 1 : 0.85}
                      stroke={selectedPos === pos && selectedDim === dim ? "white" : "none"}
                      strokeWidth={1}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedPos(pos);
                        setSelectedDim(dim);
                      }}
                    />
                  ))}
                </g>
              ))}

              {/* 选中位置高亮行 */}
              {selectedPos !== null && (
                <rect
                  x={58}
                  y={36 + selectedPos * CELL_H}
                  width={VIS_DIMS * CELL_W + 4}
                  height={CELL_H + 2}
                  fill="none"
                  stroke="rgba(249,115,22,0.8)"
                  strokeWidth={1.5}
                  rx={1}
                />
              )}
              {/* 选中维度高亮列 */}
              {selectedDim !== null && (
                <rect
                  x={59 + selectedDim * CELL_W}
                  y={36}
                  width={CELL_W + 1}
                  height={SEQ_LEN * CELL_H + 4}
                  fill="none"
                  stroke="rgba(96,165,250,0.8)"
                  strokeWidth={1.5}
                  rx={1}
                />
              )}

              {/* 颜色条图例 */}
              {Array.from({ length: 40 }, (_, i) => {
                const v = -1 + (i / 39) * 2;
                return (
                  <rect
                    key={i}
                    x={60 + i * (VIS_DIMS * CELL_W / 40)}
                    y={38 + SEQ_LEN * CELL_H + 8}
                    width={VIS_DIMS * CELL_W / 40 + 0.5}
                    height={8}
                    fill={peColor(v)}
                  />
                );
              })}
              <text x={60} y={38 + SEQ_LEN * CELL_H + 26} style={{ fontSize: "0.5rem", fill: "var(--color-text-muted)" }}>-1</text>
              <text x={60 + VIS_DIMS * CELL_W / 2} y={38 + SEQ_LEN * CELL_H + 26} textAnchor="middle" style={{ fontSize: "0.5rem", fill: "var(--color-text-muted)" }}>0</text>
              <text x={60 + VIS_DIMS * CELL_W} y={38 + SEQ_LEN * CELL_H + 26} textAnchor="end" style={{ fontSize: "0.5rem", fill: "var(--color-text-muted)" }}>+1</text>
            </svg>
          </div>

          {/* 选中格子信息 */}
          {selectedPos !== null && selectedDim !== null && (
            <div
              className="p-4 rounded-xl border text-xs"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div style={{ color: "var(--color-text-muted)" }}>位置 pos</div>
                  <div className="font-mono text-lg mt-0.5" style={{ color: "rgba(249,115,22,0.9)" }}>{selectedPos}</div>
                </div>
                <div>
                  <div style={{ color: "var(--color-text-muted)" }}>维度 dim</div>
                  <div className="font-mono text-lg mt-0.5" style={{ color: "rgba(96,165,250,0.9)" }}>{selectedDim}</div>
                </div>
                <div>
                  <div style={{ color: "var(--color-text-muted)" }}>PE 值</div>
                  <div className="font-mono text-lg mt-0.5" style={{ color: "var(--color-accent)" }}>
                    {peMatrix[selectedPos][selectedDim].toFixed(4)}
                  </div>
                </div>
              </div>
              <div className="mt-3 font-mono p-2 rounded text-xs" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent-2)" }}>
                PE({selectedPos}, {selectedDim}) = {selectedDim % 2 === 0
                  ? `sin(${selectedPos} / 10000^(${selectedDim}/${D_MODEL})) = sin(${(selectedPos / Math.pow(10000, selectedDim / D_MODEL)).toFixed(4)})`
                  : `cos(${selectedPos} / 10000^(${selectedDim - 1}/${D_MODEL})) = cos(${(selectedPos / Math.pow(10000, (selectedDim - 1) / D_MODEL)).toFixed(4)})`
                }
              </div>
            </div>
          )}
        </>
      ) : (
        /* 曲线模式 */
        <CurveMode peMatrix={peMatrix} />
      )}

      {/* 原理说明 */}
      <div
        className="p-4 rounded-xl border text-xs leading-relaxed space-y-2"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <p>
          <strong style={{ color: "var(--color-text)" }}>为什么需要位置编码？</strong>
          Transformer 的自注意力机制对输入顺序不敏感（置换不变），需要显式注入位置信息。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>sin/cos 设计的优势：</strong>
          ① 不同位置的编码互不相同；② 任意固定偏移 k，PE(pos+k) 可由 PE(pos) 线性变换得到，帮助模型学习相对位置。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>低维 vs 高维：</strong>
          低维（dim 小）频率高，区分相邻位置；高维（dim 大）频率低，提供全局位置感。热图左侧变化快、右侧变化慢正体现了这一点。
        </p>
      </div>
    </div>
  );
}

// ─── 曲线模式子组件 ───────────────────────────────────────────────────────────
function CurveMode({ peMatrix }: { peMatrix: number[][] }) {
  const [selectedDims, setSelectedDims] = useState([0, 1, 8, 9, 24, 25]);
  const CURVE_W = 460, CURVE_H = 220, CPL = 50, CPR = 20, CPT = 20, CPB = 30;
  const COLORS = ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#c084fc", "#f472b6"];

  function curvePath(dim: number): string {
    return peMatrix.map((row, pos) => {
      const sx = CPL + (pos / (SEQ_LEN - 1)) * (CURVE_W - CPL - CPR);
      const sy = CPT + ((1 - (row[dim] + 1) / 2)) * (CURVE_H - CPT - CPB);
      return `${pos === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    }).join(" ");
  }

  const presetGroups = [
    { label: "相邻维度（低频）", dims: [0, 1] },
    { label: "相邻维度（中频）", dims: [8, 9] },
    { label: "相邻维度（高频）", dims: [24, 25] },
    { label: "sin 各频率", dims: [0, 4, 8, 16, 24, 30] },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>预设：</span>
        {presetGroups.map(({ label, dims }) => (
          <button
            key={label}
            onClick={() => setSelectedDims(dims)}
            className="px-3 py-1 rounded-lg text-xs transition-all cursor-pointer"
            style={{
              backgroundColor: JSON.stringify(selectedDims) === JSON.stringify(dims) ? "rgba(124,109,250,0.2)" : "var(--color-surface-2)",
              color: JSON.stringify(selectedDims) === JSON.stringify(dims) ? "var(--color-accent)" : "var(--color-text-muted)",
              border: `1px solid ${JSON.stringify(selectedDims) === JSON.stringify(dims) ? "rgba(124,109,250,0.4)" : "var(--color-border)"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className="p-3 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
      >
        <svg width={CURVE_W} height={CURVE_H} style={{ display: "block", margin: "0 auto" }}>
          {/* 网格 */}
          {[-1, 0, 1].map((yv) => {
            const sy = CPT + ((1 - (yv + 1) / 2)) * (CURVE_H - CPT - CPB);
            return <line key={yv} x1={CPL} y1={sy} x2={CURVE_W - CPR} y2={sy} stroke={yv === 0 ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.06)"} strokeWidth={1} />;
          })}
          {[0, 8, 16, 24, 31].map((px) => {
            const sx = CPL + (px / (SEQ_LEN - 1)) * (CURVE_W - CPL - CPR);
            return <line key={px} x1={sx} y1={CPT} x2={sx} y2={CURVE_H - CPB} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />;
          })}
          {/* 轴 */}
          {[0, 8, 16, 24, 31].map((px) => {
            const sx = CPL + (px / (SEQ_LEN - 1)) * (CURVE_W - CPL - CPR);
            return <text key={px} x={sx} y={CURVE_H - CPB + 12} textAnchor="middle" style={{ fontSize: "0.5rem", fill: "var(--color-text-muted)" }}>{px}</text>;
          })}
          {[-1, 0, 1].map((yv) => {
            const sy = CPT + ((1 - (yv + 1) / 2)) * (CURVE_H - CPT - CPB);
            return <text key={yv} x={CPL - 4} y={sy + 4} textAnchor="end" style={{ fontSize: "0.5rem", fill: "var(--color-text-muted)" }}>{yv}</text>;
          })}
          <text x={(CURVE_W - CPL - CPR) / 2 + CPL} y={CURVE_H - 4} textAnchor="middle" style={{ fontSize: "0.5rem", fill: "var(--color-text-muted)" }}>位置 (pos)</text>
          {/* 曲线 */}
          {selectedDims.slice(0, 6).map((dim, i) => (
            <g key={dim}>
              <path d={curvePath(dim)} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth={1.8} opacity={0.9} />
            </g>
          ))}
        </svg>
        {/* 图例 */}
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {selectedDims.slice(0, 6).map((dim, i) => (
            <div key={dim} className="flex items-center gap-1.5 text-xs">
              <div className="w-4 h-0.5" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span style={{ color: COLORS[i % COLORS.length] }}>
                dim={dim} ({dim % 2 === 0 ? "sin" : "cos"})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

// ─── 激活函数定义 ──────────────────────────────────────────────────────────────
interface ActivationFn {
  name: string;
  color: string;
  fn: (x: number) => number;
  grad: (x: number) => number;
  desc: string;
  issue?: string;
}

const ACTIVATIONS: ActivationFn[] = [
  {
    name: "Sigmoid",
    color: "#f87171",
    fn: (x) => 1 / (1 + Math.exp(-x)),
    grad: (x) => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s); },
    desc: "将输入压缩到 (0,1)，早期常用",
    issue: "梯度饱和：|x|>3 时梯度趋近 0，导致梯度消失",
  },
  {
    name: "Tanh",
    color: "#60a5fa",
    fn: (x) => Math.tanh(x),
    grad: (x) => 1 - Math.tanh(x) ** 2,
    desc: "输出范围 (-1,1)，零均值，比 Sigmoid 更优",
    issue: "同样存在梯度饱和问题",
  },
  {
    name: "ReLU",
    color: "#34d399",
    fn: (x) => Math.max(0, x),
    grad: (x) => (x > 0 ? 1 : 0),
    desc: "计算简单，正区间梯度恒为 1，训练快",
    issue: "Dead Neuron：负区间梯度为 0，神经元可能永久失活",
  },
  {
    name: "Leaky ReLU",
    color: "#fbbf24",
    fn: (x) => (x > 0 ? x : 0.01 * x),
    grad: (x) => (x > 0 ? 1 : 0.01),
    desc: "负区间保留小斜率 0.01，缓解 Dead Neuron",
    issue: "负区间斜率为超参数，需要调优",
  },
  {
    name: "GELU",
    color: "#c084fc",
    fn: (x) => x * 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))),
    grad: (x) => {
      const s = 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
      const ds = 0.5 * Math.sqrt(2 / Math.PI) * (1 + 3 * 0.044715 * x * x) * (1 - Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)) ** 2);
      return s + x * ds;
    },
    desc: "GPT/BERT 默认激活函数，平滑 ReLU，负区间有非零输出",
    issue: "计算略复杂",
  },
];

// ─── SVG 参数 ─────────────────────────────────────────────────────────────────
const W = 420, H = 240, PAD_L = 40, PAD_R = 20, PAD_T = 20, PAD_B = 30;
const X_MIN = -5, X_MAX = 5, Y_MIN = -1.5, Y_MAX = 1.5;

function toSvg(x: number, y: number) {
  return {
    sx: PAD_L + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD_L - PAD_R),
    sy: PAD_T + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * (H - PAD_T - PAD_B),
  };
}

function buildPath(fn: (x: number) => number, clamp = 1.5): string {
  const pts: string[] = [];
  const N = 300;
  for (let i = 0; i <= N; i++) {
    const x = X_MIN + (i / N) * (X_MAX - X_MIN);
    const y = Math.max(-clamp, Math.min(clamp, fn(x)));
    const { sx, sy } = toSvg(x, y);
    pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
  }
  return pts.join(" ");
}

// 坐标轴刻度
const xTicks = [-4, -2, 0, 2, 4];
const yTicks = [-1, 0, 1];

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function ActivationVisualizer() {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(["ReLU", "GELU", "Sigmoid"]));
  const [showGrad, setShowGrad] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  function toggleFn(name: string) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(name)) { if (next.size > 1) next.delete(name); }
      else next.add(name);
      return next;
    });
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const x = X_MIN + ((px - PAD_L) / (W - PAD_L - PAD_R)) * (X_MAX - X_MIN);
    if (x >= X_MIN && x <= X_MAX) setHoverX(x);
    else setHoverX(null);
  }

  return (
    <div className="space-y-4">
      {/* 控制栏 */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          {ACTIVATIONS.map(({ name, color }) => (
            <button
              key={name}
              onClick={() => toggleFn(name)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: enabled.has(name) ? `${color}22` : "var(--color-surface-2)",
                color: enabled.has(name) ? color : "var(--color-text-muted)",
                border: `1px solid ${enabled.has(name) ? color : "var(--color-border)"}`,
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowGrad(!showGrad)}
          className="px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ml-auto"
          style={{
            backgroundColor: showGrad ? "rgba(251,191,36,0.15)" : "var(--color-surface-2)",
            color: showGrad ? "#fbbf24" : "var(--color-text-muted)",
            border: `1px solid ${showGrad ? "rgba(251,191,36,0.5)" : "var(--color-border)"}`,
          }}
        >
          {showGrad ? "▼ 隐藏导数" : "▲ 显示导数（梯度）"}
        </button>
      </div>

      {/* SVG 图 */}
      <div
        className="p-3 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
      >
        <p className="text-xs mb-2 text-center" style={{ color: "var(--color-text-muted)" }}>
          激活函数 f(x){showGrad ? " 及其导数 f′(x)" : ""}
          {hoverX !== null && (
            <span className="ml-2 font-mono" style={{ color: "var(--color-text)" }}>
              x = {hoverX.toFixed(2)}
            </span>
          )}
        </p>
        <svg
          width={W} height={H}
          style={{ display: "block", margin: "0 auto", cursor: "crosshair" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverX(null)}
        >
          {/* 网格 */}
          {xTicks.map((tx) => {
            const { sx } = toSvg(tx, 0);
            return <line key={`gx${tx}`} x1={sx} y1={PAD_T} x2={sx} y2={H - PAD_B} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />;
          })}
          {yTicks.map((ty) => {
            const { sy } = toSvg(0, ty);
            return <line key={`gy${ty}`} x1={PAD_L} y1={sy} x2={W - PAD_R} y2={sy} stroke={ty === 0 ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.06)"} strokeWidth={ty === 0 ? 1.5 : 1} />;
          })}
          {/* 坐标轴 */}
          {(() => { const { sy } = toSvg(0, 0); const { sx } = toSvg(0, 0); return (<>
            <line x1={PAD_L} y1={sy} x2={W - PAD_R} y2={sy} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
            <line x1={sx} y1={PAD_T} x2={sx} y2={H - PAD_B} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
          </>); })()}
          {/* 刻度标签 */}
          {xTicks.map((tx) => {
            const { sx, sy } = toSvg(tx, 0);
            return <text key={`tx${tx}`} x={sx} y={sy + 14} textAnchor="middle" style={{ fontSize: "0.55rem", fill: "var(--color-text-muted)" }}>{tx}</text>;
          })}
          {yTicks.filter((t) => t !== 0).map((ty) => {
            const { sx, sy } = toSvg(0, ty);
            return <text key={`ty${ty}`} x={sx - 5} y={sy + 4} textAnchor="end" style={{ fontSize: "0.55rem", fill: "var(--color-text-muted)" }}>{ty}</text>;
          })}

          {/* 悬停竖线 */}
          {hoverX !== null && (() => {
            const { sx } = toSvg(hoverX, 0);
            return <line x1={sx} y1={PAD_T} x2={sx} y2={H - PAD_B} stroke="rgba(0,0,0,0.15)" strokeWidth={1} strokeDasharray="3,3" />;
          })()}

          {/* 激活函数曲线 */}
          {ACTIVATIONS.filter((a) => enabled.has(a.name)).map(({ name, color, fn, grad }) => (
            <g key={name}>
              <path d={buildPath(fn)} fill="none" stroke={color} strokeWidth={2} opacity={0.9} />
              {showGrad && (
                <path d={buildPath(grad, 1.5)} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5} strokeDasharray="5,3" />
              )}
              {/* 悬停值 */}
              {hoverX !== null && (() => {
                const y = Math.max(-1.5, Math.min(1.5, fn(hoverX)));
                const { sx, sy } = toSvg(hoverX, y);
                return (
                  <circle cx={sx} cy={sy} r={3.5} fill={color} stroke="white" strokeWidth={1} />
                );
              })()}
            </g>
          ))}
        </svg>

        {/* 悬停数值 */}
        {hoverX !== null && (
          <div className="mt-2 flex flex-wrap gap-3 justify-center">
            {ACTIVATIONS.filter((a) => enabled.has(a.name)).map(({ name, color, fn, grad }) => (
              <div key={name} className="text-xs font-mono" style={{ color }}>
                {name}: f={fn(hoverX).toFixed(3)}{showGrad && `, f′=${grad(hoverX).toFixed(3)}`}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 说明卡片 */}
      <div className="grid grid-cols-1 gap-2">
        {ACTIVATIONS.filter((a) => enabled.has(a.name)).map(({ name, color, desc, issue }) => (
          <div key={name} className="p-3 rounded-lg text-xs flex gap-3" style={{ backgroundColor: "var(--color-surface-2)", border: `1px solid ${color}33` }}>
            <span className="font-semibold shrink-0 w-20" style={{ color }}>{name}</span>
            <div style={{ color: "var(--color-text-muted)" }}>
              {desc}
              {issue && <span className="ml-1" style={{ color: "#fbbf24" }}>⚠ {issue}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 梯度消失说明 */}
      {showGrad && (
        <div
          className="p-4 rounded-xl border text-xs leading-relaxed"
          style={{ backgroundColor: "rgba(248,113,113,0.06)", borderColor: "rgba(248,113,113,0.25)", color: "var(--color-text-muted)" }}
        >
          <span className="font-semibold" style={{ color: "#f87171" }}>梯度消失（Vanishing Gradient）：</span>
          虚线为导数曲线。Sigmoid/Tanh 在 |x| 较大时导数趋近 0 —— 多层网络中梯度连乘后接近零，靠近输入层的参数几乎不更新。ReLU 正区间导数恒为 1，有效缓解此问题。
        </div>
      )}
    </div>
  );
}

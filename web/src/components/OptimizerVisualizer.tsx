"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// ─── 损失曲面（二元函数：碗形 + 偏置，制造非对称鞍点）─────────────────────────
function loss(x: number, y: number): number {
  return 0.5 * x * x + 3 * y * y + 0.3 * Math.sin(3 * x) * Math.cos(2 * y);
}
function gradX(x: number, y: number): number {
  return x + 0.9 * Math.cos(3 * x) * Math.cos(2 * y);
}
function gradY(x: number, y: number): number {
  return 6 * y - 0.6 * Math.sin(3 * x) * Math.sin(2 * y);
}

// ─── SVG 坐标映射 ─────────────────────────────────────────────────────────────
const W = 400, H = 320, PAD = 30;
const X_MIN = -3, X_MAX = 3, Y_MIN = -2, Y_MAX = 2;

function toSvg(x: number, y: number) {
  return {
    sx: PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD * 2),
    sy: H - PAD - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD * 2),
  };
}

// ─── 等高线数据预计算 ──────────────────────────────────────────────────────────
const CONTOUR_LEVELS = [0.1, 0.3, 0.7, 1.3, 2.2, 3.5, 5.5, 8.5];
const GRID_N = 80;

function buildContourPaths(): { level: number; d: string }[] {
  // 简化：用矩形格子近似等高线（marching squares 简化版，只画矩形轮廓）
  // 实际用 SVG path 绘制近似等值线
  const cell = (X_MAX - X_MIN) / GRID_N;
  const paths: { level: number; d: string }[] = [];

  for (const lv of CONTOUR_LEVELS) {
    const segments: string[] = [];
    for (let i = 0; i < GRID_N; i++) {
      for (let j = 0; j < GRID_N; j++) {
        const x0 = X_MIN + i * cell;
        const y0 = Y_MIN + j * cell;
        const x1 = x0 + cell;
        const y1 = y0 + cell;
        const v00 = loss(x0, y0);
        const v10 = loss(x1, y0);
        const v01 = loss(x0, y1);
        const v11 = loss(x1, y1);
        // 如果格子跨越等值线
        const above00 = v00 > lv, above10 = v10 > lv, above01 = v01 > lv, above11 = v11 > lv;
        if (above00 === above10 && above10 === above01 && above01 === above11) continue;
        // 画格子中心点（近似）
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
        const { sx, sy } = toSvg(cx, cy);
        segments.push(`M${sx.toFixed(1)},${sy.toFixed(1)} h1`);
      }
    }
    paths.push({ level: lv, d: segments.join(" ") });
  }
  return paths;
}

const CONTOUR_PATHS = buildContourPaths();

// ─── 优化器 ───────────────────────────────────────────────────────────────────
interface Point { x: number; y: number }

function stepSGD(p: Point, lr: number): Point {
  return { x: p.x - lr * gradX(p.x, p.y), y: p.y - lr * gradY(p.x, p.y) };
}

function makeMomentumStepper(beta = 0.85) {
  let vx = 0, vy = 0;
  return (p: Point, lr: number): Point => {
    vx = beta * vx + (1 - beta) * gradX(p.x, p.y);
    vy = beta * vy + (1 - beta) * gradY(p.x, p.y);
    return { x: p.x - lr * vx, y: p.y - lr * vy };
  };
}

function makeAdamStepper(beta1 = 0.9, beta2 = 0.999, eps = 1e-8) {
  let mx = 0, my = 0, vx = 0, vy = 0, t = 0;
  return (p: Point, lr: number): Point => {
    t++;
    const gx = gradX(p.x, p.y), gy = gradY(p.x, p.y);
    mx = beta1 * mx + (1 - beta1) * gx;
    my = beta1 * my + (1 - beta1) * gy;
    vx = beta2 * vx + (1 - beta2) * gx * gx;
    vy = beta2 * vy + (1 - beta2) * gy * gy;
    const mxHat = mx / (1 - Math.pow(beta1, t));
    const myHat = my / (1 - Math.pow(beta1, t));
    const vxHat = vx / (1 - Math.pow(beta2, t));
    const vyHat = vy / (1 - Math.pow(beta2, t));
    return {
      x: p.x - lr * mxHat / (Math.sqrt(vxHat) + eps),
      y: p.y - lr * myHat / (Math.sqrt(vyHat) + eps),
    };
  };
}

function makeRMSPropStepper(beta = 0.9, eps = 1e-8) {
  let vx = 0, vy = 0;
  return (p: Point, lr: number): Point => {
    const gx = gradX(p.x, p.y), gy = gradY(p.x, p.y);
    vx = beta * vx + (1 - beta) * gx * gx;
    vy = beta * vy + (1 - beta) * gy * gy;
    return {
      x: p.x - lr * gx / (Math.sqrt(vx) + eps),
      y: p.y - lr * gy / (Math.sqrt(vy) + eps),
    };
  };
}

const START: Point = { x: -2.5, y: 1.6 };
const MAX_STEPS = 80;
const LR_MAP: Record<string, number> = { SGD: 0.05, Momentum: 0.06, RMSProp: 0.06, Adam: 0.12 };
const COLORS: Record<string, string> = {
  SGD: "#f87171",
  Momentum: "#60a5fa",
  RMSProp: "#34d399",
  Adam: "#fbbf24",
};

function computeTrajectory(name: string): Point[] {
  const pts: Point[] = [{ ...START }];
  const lr = LR_MAP[name];
  let step: (p: Point, lr: number) => Point;
  if (name === "SGD") step = (p, l) => stepSGD(p, l);
  else if (name === "Momentum") { const s = makeMomentumStepper(); step = (p, l) => s(p, l); }
  else if (name === "Adam") { const s = makeAdamStepper(); step = (p, l) => s(p, l); }
  else { const s = makeRMSPropStepper(); step = (p, l) => s(p, l); }

  for (let i = 0; i < MAX_STEPS; i++) {
    const cur = pts[pts.length - 1];
    const nx = step(cur, lr);
    pts.push({
      x: Math.max(X_MIN, Math.min(X_MAX, nx.x)),
      y: Math.max(Y_MIN, Math.min(Y_MAX, nx.y)),
    });
    if (Math.abs(nx.x) < 0.02 && Math.abs(nx.y) < 0.02) break;
  }
  return pts;
}

const ALL_OPTIMIZERS = ["SGD", "Momentum", "RMSProp", "Adam"] as const;
type OptimizerName = typeof ALL_OPTIMIZERS[number];

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function OptimizerVisualizer() {
  const [enabled, setEnabled] = useState<Set<OptimizerName>>(new Set(["SGD", "Momentum", "Adam"]));
  const [animStep, setAnimStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const trajectories: Record<string, Point[]> = {};
  for (const name of ALL_OPTIMIZERS) {
    trajectories[name] = computeTrajectory(name);
  }
  const maxLen = Math.max(...ALL_OPTIMIZERS.map((n) => trajectories[n].length));

  const startPlay = useCallback(() => {
    setAnimStep(0);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setAnimStep((s) => {
        if (s >= maxLen - 1) {
          setPlaying(false);
          return maxLen - 1;
        }
        return s + 1;
      });
    }, 60);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, maxLen]);

  function toggleOptimizer(name: OptimizerName) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(name)) { if (next.size > 1) next.delete(name); }
      else next.add(name);
      return next;
    });
  }

  function pathD(pts: Point[], upTo: number): string {
    const slice = pts.slice(0, upTo + 1);
    return slice.map(({ x, y }, i) => {
      const { sx, sy } = toSvg(x, y);
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    }).join(" ");
  }

  return (
    <div className="space-y-5">
      {/* 优化器开关 */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>显示优化器：</span>
        {ALL_OPTIMIZERS.map((name) => (
          <button
            key={name}
            onClick={() => toggleOptimizer(name)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: enabled.has(name) ? `${COLORS[name]}22` : "var(--color-surface-2)",
              color: enabled.has(name) ? COLORS[name] : "var(--color-text-muted)",
              border: `1px solid ${enabled.has(name) ? COLORS[name] : "var(--color-border)"}`,
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* SVG 损失曲面 */}
      <div
        className="p-3 rounded-xl border overflow-x-auto"
        style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
      >
        <svg width={W} height={H} style={{ display: "block", margin: "0 auto" }}>
          {/* 等高线 */}
          {CONTOUR_PATHS.map(({ level, d }) => (
            <path
              key={level}
              d={d}
              fill="none"
              stroke={`rgba(124,109,250,${0.12 + level * 0.035})`}
              strokeWidth={1.5}
            />
          ))}
          {/* 坐标轴 */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
          {/* 全局最小值标记 */}
          {(() => { const { sx, sy } = toSvg(0, 0); return (
            <g>
              <circle cx={sx} cy={sy} r={5} fill="rgba(86,212,179,0.9)" stroke="rgba(86,212,179,1)" strokeWidth={1.5} />
              <text x={sx + 7} y={sy + 4} style={{ fontSize: "0.6rem", fill: "rgba(86,212,179,0.9)" }}>最小值</text>
            </g>
          ); })()}
          {/* 起始点 */}
          {(() => { const { sx, sy } = toSvg(START.x, START.y); return (
            <circle cx={sx} cy={sy} r={5} fill="rgba(0,0,0,0.18)" stroke="rgba(0,0,0,0.5)" strokeWidth={1.5} />
          ); })()}
          {/* 优化器轨迹 */}
          {ALL_OPTIMIZERS.filter((n) => enabled.has(n)).map((name) => {
            const pts = trajectories[name];
            const upTo = Math.min(animStep, pts.length - 1);
            const cur = pts[upTo];
            const { sx, sy } = toSvg(cur.x, cur.y);
            return (
              <g key={name}>
                <path d={pathD(pts, upTo)} fill="none" stroke={COLORS[name]} strokeWidth={1.8} opacity={0.85} />
                <circle cx={sx} cy={sy} r={5} fill={COLORS[name]} stroke="white" strokeWidth={1.5} />
              </g>
            );
          })}
          {/* 图例 */}
          {(() => {
            const { sx, sy } = toSvg(START.x, START.y);
            return <text x={sx + 7} y={sy - 6} style={{ fontSize: "0.6rem", fill: "rgba(0,0,0,0.5)" }}>起点</text>;
          })()}
        </svg>
      </div>

      {/* 进度条 + 控制 */}
      <div className="flex items-center gap-3">
        <button
          onClick={startPlay}
          disabled={playing}
          className="px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: "rgba(124,109,250,0.2)", color: "var(--color-accent)", border: "1px solid rgba(124,109,250,0.4)" }}
        >
          {playing ? "运行中..." : "▶ 重新开始"}
        </button>
        <input
          type="range" min={0} max={maxLen - 1} value={animStep}
          onChange={(e) => { setPlaying(false); setAnimStep(Number(e.target.value)); }}
          className="flex-1 accent-purple-500"
        />
        <span className="text-xs font-mono w-14 text-right" style={{ color: "var(--color-text-muted)" }}>
          步 {animStep}/{maxLen - 1}
        </span>
      </div>

      {/* 当前损失值 */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${enabled.size}, 1fr)` }}>
        {ALL_OPTIMIZERS.filter((n) => enabled.has(n)).map((name) => {
          const pts = trajectories[name];
          const p = pts[Math.min(animStep, pts.length - 1)];
          const lv = loss(p.x, p.y);
          return (
            <div key={name} className="p-2.5 rounded-lg text-center" style={{ backgroundColor: `${COLORS[name]}11`, border: `1px solid ${COLORS[name]}44` }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: COLORS[name] }}>{name}</div>
              <div className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
                Loss: <span style={{ color: "var(--color-text)" }}>{lv.toFixed(4)}</span>
              </div>
              <div className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
                ({p.x.toFixed(3)}, {p.y.toFixed(3)})
              </div>
            </div>
          );
        })}
      </div>

      {/* 说明 */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "SGD", color: COLORS.SGD, desc: "沿梯度反方向直接更新，学习率固定，收敛慢且易震荡" },
          { name: "Momentum", color: COLORS.Momentum, desc: "累积历史梯度方向，加速穿越平坦区，减少振荡" },
          { name: "RMSProp", color: COLORS.RMSProp, desc: "对每个参数自适应学习率，除以梯度平方的指数移动平均" },
          { name: "Adam", color: COLORS.Adam, desc: "结合 Momentum + RMSProp，带偏差修正，目前最常用" },
        ].map(({ name, color, desc }) => (
          <div key={name} className="p-3 rounded-lg text-xs" style={{ backgroundColor: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
            <span className="font-semibold" style={{ color }}>{name}</span>
            <span className="ml-2" style={{ color: "var(--color-text-muted)" }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

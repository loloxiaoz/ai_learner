"use client";

import { useState, useCallback } from "react";

// ─── 网络结构 ──────────────────────────────────────────────────────────────────
// 3 层网络：输入(2) → 隐藏(3) → 输出(1)
// 前向传播值和梯度均为演示用固定数据

interface Neuron {
  id: string;
  layer: number;
  index: number;
  label: string;
  activation: number; // 前向传播激活值
  gradient: number;   // 反向传播梯度（∂L/∂a）
  delta: number;      // 误差项 δ
}

interface Weight {
  id: string;
  from: string;
  to: string;
  value: number;
  gradient: number; // ∂L/∂w
  updated: number;  // 更新后的权重
}

const LR = 0.1; // 学习率

// 固定演示网络
const NEURONS: Neuron[] = [
  // 输入层
  { id: "i0", layer: 0, index: 0, label: "x₁", activation: 0.5, gradient: 0, delta: 0 },
  { id: "i1", layer: 0, index: 1, label: "x₂", activation: 0.8, gradient: 0, delta: 0 },
  // 隐藏层
  { id: "h0", layer: 1, index: 0, label: "h₁", activation: 0.63, gradient: 0.21, delta: 0.051 },
  { id: "h1", layer: 1, index: 1, label: "h₂", activation: 0.71, gradient: 0.18, delta: 0.044 },
  { id: "h2", layer: 1, index: 2, label: "h₃", activation: 0.55, gradient: 0.24, delta: 0.059 },
  // 输出层
  { id: "o0", layer: 2, index: 0, label: "ŷ", activation: 0.72, gradient: -0.56, delta: -0.137 },
];

const WEIGHTS_DATA: Omit<Weight, "updated">[] = [
  // 输入→隐藏
  { id: "w_i0_h0", from: "i0", to: "h0", value: 0.45, gradient: 0.025 },
  { id: "w_i0_h1", from: "i0", to: "h1", value: 0.32, gradient: 0.022 },
  { id: "w_i0_h2", from: "i0", to: "h2", value: -0.18, gradient: 0.030 },
  { id: "w_i1_h0", from: "i1", to: "h0", value: 0.61, gradient: 0.041 },
  { id: "w_i1_h1", from: "i1", to: "h1", value: -0.24, gradient: 0.035 },
  { id: "w_i1_h2", from: "i1", to: "h2", value: 0.53, gradient: 0.047 },
  // 隐藏→输出
  { id: "w_h0_o0", from: "h0", to: "o0", value: 0.38, gradient: -0.086 },
  { id: "w_h1_o0", from: "h1", to: "o0", value: 0.72, gradient: -0.097 },
  { id: "w_h2_o0", from: "h2", to: "o0", value: -0.15, gradient: -0.075 },
];

const WEIGHTS: Weight[] = WEIGHTS_DATA.map((w) => ({
  ...w,
  updated: w.value - LR * w.gradient,
}));

// 演示步骤
type Step = "intro" | "forward" | "loss" | "backward_output" | "backward_hidden" | "update";

const STEPS: { id: Step; label: string; short: string }[] = [
  { id: "intro", label: "0. 初始状态", short: "初始" },
  { id: "forward", label: "1. 前向传播", short: "前向" },
  { id: "loss", label: "2. 计算损失", short: "损失" },
  { id: "backward_output", label: "3. 输出层梯度", short: "输出层∇" },
  { id: "backward_hidden", label: "4. 隐藏层梯度", short: "隐藏层∇" },
  { id: "update", label: "5. 权重更新", short: "更新" },
];

// ─── 颜色映射 ──────────────────────────────────────────────────────────────────
function gradColor(g: number): string {
  // 正梯度 → 红，负梯度 → 蓝，零 → 灰
  const abs = Math.min(Math.abs(g) * 4, 1);
  if (g > 0) return `rgba(239,68,68,${0.15 + abs * 0.65})`;
  if (g < 0) return `rgba(59,130,246,${0.15 + abs * 0.65})`;
  return "var(--color-surface-2)";
}

function activationColor(a: number): string {
  const t = Math.max(0, Math.min(a, 1));
  return `rgba(124,109,250,${0.1 + t * 0.7})`;
}

// ─── 布局计算 ─────────────────────────────────────────────────────────────────
const LAYER_X = [80, 260, 440];
const LAYER_Y_CENTERS: number[][] = [
  [100, 200],        // 输入层 2 个
  [60, 150, 240],    // 隐藏层 3 个
  [150],             // 输出层 1 个
];
const SVG_W = 520;
const SVG_H = 300;
const R = 22;

function getNeuronPos(id: string): { x: number; y: number } {
  const n = NEURONS.find((n) => n.id === id)!;
  return { x: LAYER_X[n.layer], y: LAYER_Y_CENTERS[n.layer][n.index] };
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function BackpropVisualizer() {
  const [step, setStep] = useState<Step>("intro");
  const [hoveredWeight, setHoveredWeight] = useState<string | null>(null);
  const [hoveredNeuron, setHoveredNeuron] = useState<string | null>(null);

  const showActivations = ["forward", "loss", "backward_output", "backward_hidden", "update"].includes(step);
  const showLoss = ["loss", "backward_output", "backward_hidden", "update"].includes(step);
  const showOutputGrad = ["backward_output", "backward_hidden", "update"].includes(step);
  const showHiddenGrad = ["backward_hidden", "update"].includes(step);
  const showUpdated = step === "update";

  const stepIdx = STEPS.findIndex((s) => s.id === step);
  const goNext = useCallback(() => {
    if (stepIdx < STEPS.length - 1) setStep(STEPS[stepIdx + 1].id);
  }, [stepIdx]);
  const goPrev = useCallback(() => {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1].id);
  }, [stepIdx]);

  const hovered = hoveredWeight ? WEIGHTS.find((w) => w.id === hoveredWeight) : null;
  const hoveredN = hoveredNeuron ? NEURONS.find((n) => n.id === hoveredNeuron) : null;

  return (
    <div className="space-y-6">
      {/* 步骤导航 */}
      <div>
        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>点击步骤逐步了解反向传播：</p>
        <div className="flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: step === s.id ? "rgba(124,109,250,0.2)" : "var(--color-surface-2)",
                color: step === s.id ? "var(--color-accent)" : "var(--color-text-muted)",
                border: `1px solid ${step === s.id ? "var(--color-accent)" : "var(--color-border)"}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG 网络图 */}
      <div
        className="p-4 rounded-xl border overflow-x-auto"
        style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
      >
        <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
          悬停连接或神经元查看数值 · 颜色含义：
          <span style={{ color: "rgba(239,68,68,0.9)", marginLeft: 8 }}>红 = 正梯度（权重需减小）</span>
          <span style={{ color: "rgba(59,130,246,0.9)", marginLeft: 8 }}>蓝 = 负梯度（权重需增大）</span>
        </p>
        <svg width={SVG_W} height={SVG_H} style={{ display: "block", margin: "0 auto" }}>
          {/* 连接线 */}
          {WEIGHTS.map((w) => {
            const from = getNeuronPos(w.from);
            const to = getNeuronPos(w.to);
            const isHovered = hoveredWeight === w.id;
            const showGrad = (showOutputGrad && w.to === "o0") || (showHiddenGrad && w.to !== "o0");
            const color = showGrad ? gradColor(w.gradient) : "rgba(0,0,0,0.06)";
            const strokeW = isHovered ? 3.5 : showGrad ? 2 : 1.2;

            return (
              <line
                key={w.id}
                x1={from.x + R} y1={from.y}
                x2={to.x - R} y2={to.y}
                stroke={color}
                strokeWidth={strokeW}
                style={{ cursor: "pointer", transition: "stroke 0.3s, stroke-width 0.2s" }}
                onMouseEnter={() => setHoveredWeight(w.id)}
                onMouseLeave={() => setHoveredWeight(null)}
              />
            );
          })}

          {/* 神经元 */}
          {NEURONS.map((n) => {
            const pos = getNeuronPos(n.id);
            const isHovered = hoveredNeuron === n.id;
            const showGrad = (showOutputGrad && n.id === "o0") || (showHiddenGrad && n.layer === 1);
            const fill = showActivations ? activationColor(n.activation) : "var(--color-surface)";
            const stroke = showGrad
              ? (n.gradient < 0 ? "rgba(59,130,246,0.8)" : "rgba(239,68,68,0.8)")
              : isHovered ? "var(--color-accent)" : "var(--color-border)";

            return (
              <g
                key={n.id}
                onMouseEnter={() => setHoveredNeuron(n.id)}
                onMouseLeave={() => setHoveredNeuron(null)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={pos.x} cy={pos.y} r={R}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isHovered || showGrad ? 2 : 1.5}
                  style={{ transition: "fill 0.3s, stroke 0.3s" }}
                />
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: "0.7rem", fill: "var(--color-text)", fontWeight: 600, userSelect: "none" }}>
                  {n.label}
                </text>
                {showActivations && (
                  <text x={pos.x} y={pos.y + R + 12} textAnchor="middle"
                    style={{ fontSize: "0.55rem", fill: "var(--color-text-muted)", userSelect: "none" }}>
                    {n.activation.toFixed(2)}
                  </text>
                )}
              </g>
            );
          })}

          {/* 层标签 */}
          {[
            { x: LAYER_X[0], label: "输入层" },
            { x: LAYER_X[1], label: "隐藏层" },
            { x: LAYER_X[2], label: "输出层" },
          ].map(({ x, label }) => (
            <text key={label} x={x} y={SVG_H - 10} textAnchor="middle"
              style={{ fontSize: "0.65rem", fill: "var(--color-text-muted)", userSelect: "none" }}>
              {label}
            </text>
          ))}

          {/* 损失标注 */}
          {showLoss && (
            <g>
              <text x={LAYER_X[2] + 60} y={150 - 20} textAnchor="middle"
                style={{ fontSize: "0.65rem", fill: "rgba(249,115,22,0.9)", fontWeight: 700, userSelect: "none" }}>
                L = 0.039
              </text>
              <text x={LAYER_X[2] + 60} y={150}
                textAnchor="middle"
                style={{ fontSize: "0.6rem", fill: "var(--color-text-muted)", userSelect: "none" }}>
                y=0.36
              </text>
              <text x={LAYER_X[2] + 60} y={150 + 14}
                textAnchor="middle"
                style={{ fontSize: "0.6rem", fill: "var(--color-text-muted)", userSelect: "none" }}>
                ŷ=0.72
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* 悬停详情 */}
      {(hovered || hoveredN) && (
        <div
          className="p-4 rounded-xl border text-sm"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-accent)" }}
        >
          {hovered && (
            <div className="space-y-1">
              <p style={{ color: "var(--color-text)" }}>
                连接权重 <span style={{ fontFamily: "monospace", color: "var(--color-accent)" }}>{hovered.id}</span>
              </p>
              <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                <div>
                  <div style={{ color: "var(--color-text-muted)" }}>当前权重 w</div>
                  <div style={{ color: "var(--color-text)", fontFamily: "monospace" }}>{hovered.value.toFixed(3)}</div>
                </div>
                <div>
                  <div style={{ color: "var(--color-text-muted)" }}>梯度 ∂L/∂w</div>
                  <div style={{ color: hovered.gradient > 0 ? "rgba(239,68,68,0.9)" : "rgba(59,130,246,0.9)", fontFamily: "monospace" }}>
                    {hovered.gradient.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--color-text-muted)" }}>更新后 w - η·∇</div>
                  <div style={{ color: "rgba(86,212,179,0.9)", fontFamily: "monospace" }}>{hovered.updated.toFixed(3)}</div>
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                更新公式：w ← w − η · ∂L/∂w = {hovered.value.toFixed(3)} − 0.1 × {hovered.gradient.toFixed(4)} = {hovered.updated.toFixed(3)}
              </p>
            </div>
          )}
          {hoveredN && !hovered && (
            <div className="space-y-1">
              <p style={{ color: "var(--color-text)" }}>
                神经元 <span style={{ fontFamily: "monospace", color: "var(--color-accent)" }}>{hoveredN.label}</span>
              </p>
              <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                <div>
                  <div style={{ color: "var(--color-text-muted)" }}>激活值 a</div>
                  <div style={{ color: "var(--color-text)", fontFamily: "monospace" }}>{hoveredN.activation.toFixed(4)}</div>
                </div>
                {hoveredN.layer > 0 && (
                  <>
                    <div>
                      <div style={{ color: "var(--color-text-muted)" }}>梯度 ∂L/∂a</div>
                      <div style={{ color: hoveredN.gradient < 0 ? "rgba(59,130,246,0.9)" : "rgba(239,68,68,0.9)", fontFamily: "monospace" }}>
                        {hoveredN.gradient.toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "var(--color-text-muted)" }}>误差项 δ</div>
                      <div style={{ color: "var(--color-text-muted)", fontFamily: "monospace" }}>{hoveredN.delta.toFixed(4)}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 当前步骤说明 */}
      <div
        className="p-5 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <StepExplanation step={step} showUpdated={showUpdated} />
      </div>

      {/* 上一步 / 下一步 */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={stepIdx === 0}
          className="px-4 py-2 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
        >
          ← 上一步
        </button>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {stepIdx + 1} / {STEPS.length}
        </span>
        <button
          onClick={goNext}
          disabled={stepIdx === STEPS.length - 1}
          className="px-4 py-2 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: stepIdx < STEPS.length - 1 ? "var(--color-accent)" : "var(--color-surface-2)", color: "white", border: "1px solid transparent" }}
        >
          下一步 →
        </button>
      </div>
    </div>
  );
}

// ─── 步骤说明 ──────────────────────────────────────────────────────────────────
function StepExplanation({ step, showUpdated }: { step: Step; showUpdated: boolean }) {
  const content: Record<Step, { title: string; body: React.ReactNode }> = {
    intro: {
      title: "反向传播（Backpropagation）",
      body: (
        <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <p>神经网络通过反向传播计算每个权重的梯度，然后用梯度下降更新权重来最小化损失函数。</p>
          <p>上方展示了一个简单 3 层网络：<strong style={{ color: "var(--color-text)" }}>2 个输入 → 3 个隐藏神经元 → 1 个输出</strong>。</p>
          <p>点击「下一步」逐步观察前向传播 → 计算损失 → 反向传播梯度 → 更新权重的完整过程。</p>
        </div>
      ),
    },
    forward: {
      title: "1. 前向传播（Forward Pass）",
      body: (
        <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <p>输入数据从左到右流经网络，每个神经元计算其输入的加权和后经过激活函数（Sigmoid）：</p>
          <div className="font-mono text-xs p-2 rounded mt-1" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent-2)" }}>
            a = σ(Σ wᵢ · xᵢ + b) &nbsp;&nbsp; σ(z) = 1 / (1 + e⁻ᶻ)
          </div>
          <p>神经元圆圈颜色越深表示激活值越高（输入 x₁=0.5, x₂=0.8，输出预测 ŷ=0.72）。</p>
        </div>
      ),
    },
    loss: {
      title: "2. 计算损失（Loss Computation）",
      body: (
        <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <p>将预测值 ŷ=0.72 与真实标签 y=0.36 比较，计算均方误差损失：</p>
          <div className="font-mono text-xs p-2 rounded mt-1" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent-2)" }}>
            L = ½ · (ŷ - y)² = ½ · (0.72 - 0.36)² ≈ 0.039
          </div>
          <p>损失越大说明预测越不准确，反向传播的目标就是通过调整权重来减小 L。</p>
        </div>
      ),
    },
    backward_output: {
      title: "3. 输出层梯度（Output Layer Gradient）",
      body: (
        <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <p>从损失函数出发，先计算输出层神经元的梯度（链式法则）：</p>
          <div className="font-mono text-xs p-2 rounded mt-1" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent-2)" }}>
            ∂L/∂ŷ = ŷ - y = 0.72 - 0.36 = 0.36<br />
            δ_out = ∂L/∂ŷ · σ′(z_out) ≈ -0.137
          </div>
          <p>连接到输出层的权重梯度 = δ_out × 前一层激活值（蓝色表示负梯度，权重将增大）。</p>
        </div>
      ),
    },
    backward_hidden: {
      title: "4. 隐藏层梯度（Hidden Layer Gradient）",
      body: (
        <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <p>梯度继续向左传播到隐藏层（这就是「反向传播」名字的由来）：</p>
          <div className="font-mono text-xs p-2 rounded mt-1" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent-2)" }}>
            δ_h = (Σ w_out · δ_out) · σ′(z_h)
          </div>
          <p>每个隐藏神经元收集来自下游的所有梯度信号，乘以其激活函数导数，得到自己的误差项 δ。</p>
          <p>对应的权重梯度 = δ_h × 输入值（红色表示正梯度，权重将减小）。</p>
        </div>
      ),
    },
    update: {
      title: "5. 权重更新（Weight Update）",
      body: (
        <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <p>使用梯度下降，以学习率 η=0.1 更新所有权重：</p>
          <div className="font-mono text-xs p-2 rounded mt-1" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent-2)" }}>
            w_new = w - η · ∂L/∂w
          </div>
          <p>悬停任意连接，可看到「当前权重 → 梯度 → 更新后权重」的完整数值。</p>
          {showUpdated && (
            <p className="mt-2 text-xs p-2 rounded" style={{ backgroundColor: "rgba(86,212,179,0.08)", color: "rgba(86,212,179,0.9)", border: "1px solid rgba(86,212,179,0.2)" }}>
              完成一次参数更新！实际训练中需要重复数千到数百万次迭代才能收敛。
            </p>
          )}
        </div>
      ),
    },
  };

  const { title, body } = content[step];
  return (
    <div>
      <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>{title}</h3>
      {body}
    </div>
  );
}

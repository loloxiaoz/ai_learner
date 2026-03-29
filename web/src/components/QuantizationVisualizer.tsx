"use client";

import { useState, useMemo } from "react";

// ─── 量化格式定义 ──────────────────────────────────────────────────────────────
interface QuantFormat {
  name: string;
  bits: number;
  levels: number;
  color: string;
  desc: string;
  sizeMultiplier: number; // 相对 FP32 的存储比例
}

const FORMATS: QuantFormat[] = [
  { name: "FP32", bits: 32, levels: 4294967296, color: "#f87171", desc: "全精度，训练标准格式", sizeMultiplier: 1 },
  { name: "BF16", bits: 16, levels: 65536, color: "#fb923c", desc: "Brain Float 16，大模型训练推荐", sizeMultiplier: 0.5 },
  { name: "FP16", bits: 16, levels: 65536, color: "#fbbf24", desc: "半精度，GPU 推理加速", sizeMultiplier: 0.5 },
  { name: "INT8", bits: 8,  levels: 256, color: "#34d399", desc: "8-bit 整数，推理常用", sizeMultiplier: 0.25 },
  { name: "INT4", bits: 4,  levels: 16, color: "#60a5fa", desc: "4-bit 整数，QLoRA 使用", sizeMultiplier: 0.125 },
  { name: "INT2", bits: 2,  levels: 4, color: "#c084fc", desc: "2-bit 极端压缩，质量损失大", sizeMultiplier: 0.0625 },
];

// 模型参数量（B 表示十亿）
const MODELS = [
  { name: "7B",  params: 7 },
  { name: "13B", params: 13 },
  { name: "70B", params: 70 },
  { name: "405B",params: 405 },
];

// ─── 量化误差演示（用一段正态分布的权重）─────────────────────────────────────
function seededNorm(n: number, seed = 42): number[] {
  const vals: number[] = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    // Box-Muller
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const u1 = ((s >>> 0) / 0xffffffff);
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const u2 = ((s >>> 0) / 0xffffffff);
    vals.push(Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2));
  }
  return vals;
}

function quantize(v: number, levels: number, minV: number, maxV: number): number {
  const step = (maxV - minV) / levels;
  const quantized = Math.round((v - minV) / step) * step + minV;
  return Math.max(minV, Math.min(maxV, quantized));
}

const ORIG_WEIGHTS = seededNorm(200, 99);
const MIN_W = Math.min(...ORIG_WEIGHTS);
const MAX_W = Math.max(...ORIG_WEIGHTS);

// 构建直方图
function buildHistogram(vals: number[], bins = 30): { x: number; count: number }[] {
  const step = (MAX_W - MIN_W) / bins;
  const hist = Array.from({ length: bins }, (_, i) => ({ x: MIN_W + (i + 0.5) * step, count: 0 }));
  for (const v of vals) {
    const bin = Math.min(bins - 1, Math.floor((v - MIN_W) / step));
    hist[bin].count++;
  }
  return hist;
}

// ─── SVG 参数 ─────────────────────────────────────────────────────────────────
const HIST_W = 360, HIST_H = 120, HPAD_L = 20, HPAD_R = 10, HPAD_T = 10, HPAD_B = 20;

function histX(v: number): number {
  return HPAD_L + ((v - MIN_W) / (MAX_W - MIN_W)) * (HIST_W - HPAD_L - HPAD_R);
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function QuantizationVisualizer() {
  const [selectedFormat, setSelectedFormat] = useState<string>("INT8");
  const [selectedModel, setSelectedModel] = useState("7B");

  const fmt = FORMATS.find((f) => f.name === selectedFormat)!;
  const model = MODELS.find((m) => m.name === selectedModel)!;

  // 量化后的权重
  const quantWeights = useMemo(
    () => ORIG_WEIGHTS.map((v) => quantize(v, fmt.levels, MIN_W, MAX_W)),
    [fmt]
  );

  // 误差
  const errors = ORIG_WEIGHTS.map((v, i) => Math.abs(v - quantWeights[i]));
  const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;

  const origHist = buildHistogram(ORIG_WEIGHTS);
  const quantHist = buildHistogram(quantWeights);
  const maxCount = Math.max(...origHist.map((h) => h.count));
  const barW = (HIST_W - HPAD_L - HPAD_R) / origHist.length;

  // 模型大小
  const sizeGB = (model.params * 4 * fmt.sizeMultiplier).toFixed(1); // params * 4bytes/param * ratio

  // 量化台阶（显示离散化效果）
  const stepSize = (MAX_W - MIN_W) / fmt.levels;
  const numStepsToShow = Math.min(fmt.levels, 32);

  return (
    <div className="space-y-5">
      {/* 格式选择 */}
      <div>
        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>选择量化格式：</p>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.name}
              onClick={() => setSelectedFormat(f.name)}
              className="px-3 py-2 rounded-lg text-xs cursor-pointer transition-all"
              style={{
                backgroundColor: selectedFormat === f.name ? f.color + "22" : "var(--color-surface-2)",
                color: selectedFormat === f.name ? f.color : "var(--color-text-muted)",
                border: `1px solid ${selectedFormat === f.name ? f.color : "var(--color-border)"}`,
              }}
            >
              <div className="font-bold font-mono">{f.name}</div>
              <div className="text-xs" style={{ opacity: 0.8 }}>{f.bits}位</div>
            </button>
          ))}
        </div>
      </div>

      {/* 格式信息 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl text-center" style={{ backgroundColor: fmt.color + "11", border: `1px solid ${fmt.color}33` }}>
          <div className="text-xs mb-0.5" style={{ color: "var(--color-text-muted)" }}>量化级别数</div>
          <div className="font-bold text-lg font-mono" style={{ color: fmt.color }}>
            {fmt.levels >= 1e6 ? `${(fmt.levels / 1e6).toFixed(0)}M` : fmt.levels.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{fmt.bits}-bit</div>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
          <div className="text-xs mb-0.5" style={{ color: "var(--color-text-muted)" }}>平均量化误差</div>
          <div className="font-bold text-lg font-mono" style={{ color: meanError < 0.01 ? "rgba(52,211,153,0.9)" : meanError < 0.05 ? "#fbbf24" : "#f87171" }}>
            {meanError.toFixed(4)}
          </div>
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>均方绝对误差</div>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
          <div className="text-xs mb-0.5" style={{ color: "var(--color-text-muted)" }}>存储压缩比</div>
          <div className="font-bold text-lg font-mono" style={{ color: "rgba(52,211,153,0.9)" }}>
            {(1 / fmt.sizeMultiplier).toFixed(0)}×
          </div>
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>vs FP32</div>
        </div>
      </div>

      {/* 直方图对比 */}
      <div
        className="p-4 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-4 mb-3">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>权重分布：原始 vs 量化后</p>
          <div className="flex gap-3 ml-auto text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-0.5" style={{ backgroundColor: "rgba(0,0,0,0.18)" }} />原始 FP32</div>
            <div className="flex items-center gap-1"><div className="w-3 h-0.5" style={{ backgroundColor: fmt.color }} />{selectedFormat}</div>
          </div>
        </div>
        <svg width={HIST_W} height={HIST_H} style={{ display: "block", margin: "0 auto" }}>
          {/* 量化台阶 */}
          {fmt.levels < 256 && Array.from({ length: numStepsToShow + 1 }, (_, i) => {
            const v = MIN_W + i * stepSize;
            const x = histX(v);
            return (
              <line key={i} x1={x} y1={HPAD_T} x2={x} y2={HIST_H - HPAD_B}
                stroke={fmt.color + "33"} strokeWidth={1} />
            );
          })}
          {/* 原始权重直方图（灰色） */}
          {origHist.map((bin, i) => {
            const x = HPAD_L + i * barW;
            const h = (bin.count / maxCount) * (HIST_H - HPAD_T - HPAD_B);
            const y = HIST_H - HPAD_B - h;
            return <rect key={i} x={x} y={y} width={barW - 0.5} height={h} fill="rgba(0,0,0,0.1)" />;
          })}
          {/* 量化后直方图 */}
          {quantHist.map((bin, i) => {
            const x = HPAD_L + i * barW;
            const h = (bin.count / maxCount) * (HIST_H - HPAD_T - HPAD_B);
            const y = HIST_H - HPAD_B - h;
            return <rect key={i} x={x} y={y} width={barW - 0.5} height={h} fill={fmt.color + "66"} />;
          })}
          {/* X 轴 */}
          <line x1={HPAD_L} y1={HIST_H - HPAD_B} x2={HIST_W - HPAD_R} y2={HIST_H - HPAD_B} stroke="rgba(0,0,0,0.12)" strokeWidth={1} />
          {[-2, 0, 2].map((v) => {
            const x = histX(Math.max(MIN_W, Math.min(MAX_W, v)));
            return (
              <g key={v}>
                <line x1={x} y1={HIST_H - HPAD_B} x2={x} y2={HIST_H - HPAD_B + 3} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
                <text x={x} y={HIST_H - 4} textAnchor="middle" style={{ fontSize: "0.5rem", fill: "var(--color-text-muted)" }}>{v}</text>
              </g>
            );
          })}
          {/* 量化步长标注 */}
          {fmt.levels < 256 && (
            <text x={HIST_W / 2} y={HPAD_T + 8} textAnchor="middle" style={{ fontSize: "0.5rem", fill: fmt.color }}>
              步长 Δ = {stepSize.toFixed(3)}（每个量化区间宽度）
            </text>
          )}
        </svg>
        {fmt.bits <= 4 && (
          <p className="text-xs mt-2 text-center" style={{ color: fmt.color }}>
            ⚠ {fmt.bits}-bit 只有 {fmt.levels} 个离散级别，分布被严重「压扁」，导致精度损失
          </p>
        )}
      </div>

      {/* 模型大小对比 */}
      <div
        className="p-4 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>模型显存占用（GB）</p>
          <div className="flex gap-2">
            {MODELS.map((m) => (
              <button key={m.name} onClick={() => setSelectedModel(m.name)}
                className="px-2 py-0.5 rounded text-xs cursor-pointer transition-all"
                style={{ backgroundColor: selectedModel === m.name ? "rgba(124,109,250,0.2)" : "var(--color-surface-2)", color: selectedModel === m.name ? "var(--color-accent)" : "var(--color-text-muted)", border: `1px solid ${selectedModel === m.name ? "rgba(124,109,250,0.4)" : "var(--color-border)"}` }}
              >{m.name}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {FORMATS.map((f) => {
            const gb = model.params * 4 * f.sizeMultiplier;
            const maxGb = model.params * 4;
            const isSelected = f.name === selectedFormat;
            return (
              <div key={f.name} className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedFormat(f.name)}>
                <span className="text-xs font-mono w-10" style={{ color: isSelected ? f.color : "var(--color-text-muted)" }}>{f.name}</span>
                <div className="flex-1 h-4 rounded" style={{ backgroundColor: "var(--color-surface-2)" }}>
                  <div className="h-4 rounded flex items-center justify-end pr-1.5 transition-all"
                    style={{ width: `${(gb / maxGb) * 100}%`, backgroundColor: f.color + (isSelected ? "cc" : "55"), minWidth: 20 }}>
                    <span className="text-xs font-mono" style={{ color: "white", fontSize: "0.5rem" }}>{gb.toFixed(1)}G</span>
                  </div>
                </div>
                <span className="text-xs font-mono w-16 text-right" style={{ color: isSelected ? f.color : "var(--color-text-muted)" }}>
                  {gb < 8 ? "单卡 ✓" : gb < 24 ? "A100 ✓" : gb < 80 ? "多卡" : "集群"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-3 text-center" style={{ color: "var(--color-text-muted)" }}>
          当前选择：<span style={{ color: fmt.color, fontWeight: 600 }}>{selectedFormat}</span> × {selectedModel} ≈ <span style={{ color: fmt.color, fontWeight: 700 }}>{sizeGB} GB</span> 显存
        </p>
      </div>

      {/* 说明 */}
      <div className="p-4 rounded-xl border text-xs leading-relaxed space-y-2" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
        <p>
          <strong style={{ color: "var(--color-text)" }}>量化的本质：</strong>
          用更少的 bit 来表示每个权重，牺牲数值精度换取存储和计算效率。量化误差源于浮点值被映射到最近的离散格点。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>GPTQ / AWQ：</strong>
          直接量化（absmax、zero-point）会损失精度。GPTQ 通过逐层二阶优化补偿误差；AWQ 先识别「重要」权重并保护，让 INT4 效果接近 FP16。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>激活量化的难点：</strong>
          激活值（Attention 中间结果）分布比权重更尖锐、存在异常值，量化难度更高，SmoothQuant 通过迁移缩放来缓解。
        </p>
      </div>
    </div>
  );
}

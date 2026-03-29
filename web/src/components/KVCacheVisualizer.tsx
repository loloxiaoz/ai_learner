"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── 示例序列 ──────────────────────────────────────────────────────────────────
const SEQUENCES = [
  {
    id: "short",
    label: "短序列（8 token）",
    tokens: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy"],
  },
  {
    id: "long",
    label: "中等序列（12 token）",
    tokens: ["Once", "upon", "a", "time", "in", "a", "land", "far", "far", "away", "there", "lived"],
  },
];

// 颜色
const COLOR_COMPUTE = "rgba(249,115,22,0.85)";    // 橙：当前正在计算
const COLOR_CACHED  = "rgba(52,211,153,0.6)";     // 绿：从缓存读取
const COLOR_PENDING = "rgba(0,0,0,0.04)";   // 灰：还未生成
const COLOR_WASTED  = "rgba(248,113,113,0.5)";    // 红：重复计算（无 cache 的浪费）

const CELL = 30, GAP = 2;

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function KVCacheVisualizer() {
  const [seqIdx, setSeqIdx] = useState(0);
  const [genStep, setGenStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const seq = SEQUENCES[seqIdx];
  const N = seq.tokens.length;

  // 重置
  function reset(newSeqIdx?: number) {
    setPlaying(false);
    setGenStep(0);
    if (newSeqIdx !== undefined) setSeqIdx(newSeqIdx);
  }

  const startPlay = useCallback(() => {
    setGenStep(0);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setGenStep((s) => {
        if (s >= N - 1) { setPlaying(false); return N - 1; }
        return s + 1;
      });
    }, 700);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, N]);

  // 计算量统计
  // 无缓存：生成第 t 个 token（0-indexed），需要计算 t+1 个 K/V
  // 有缓存：生成第 t 个 token，只需计算 1 个新 K/V（若 t>0）
  const computeWithout = Array.from({ length: N }, (_, t) => t + 1); // [1,2,3,...,N]
  const computeWith    = Array.from({ length: N }, (_, t) => 1);     // [1,1,1,...,1]
  const totalWithout = computeWithout.slice(0, genStep + 1).reduce((a, b) => a + b, 0);
  const totalWith    = computeWith.slice(0, genStep + 1).reduce((a, b) => a + b, 0);
  const totalFull    = computeWithout.reduce((a, b) => a + b, 0);
  const savedPct     = totalWithout > 0 ? (((totalWithout - totalWith) / totalWithout) * 100).toFixed(0) : "0";

  const W = N * (CELL + GAP) + 4;

  return (
    <div className="space-y-5">
      {/* 序列选择 */}
      <div className="flex gap-2">
        {SEQUENCES.map((s, i) => (
          <button key={s.id} onClick={() => reset(i)}
            className="px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-all"
            style={{ backgroundColor: seqIdx === i ? "rgba(124,109,250,0.2)" : "var(--color-surface-2)", color: seqIdx === i ? "var(--color-accent)" : "var(--color-text-muted)", border: `1px solid ${seqIdx === i ? "rgba(124,109,250,0.4)" : "var(--color-border)"}` }}
          >{s.label}</button>
        ))}
      </div>

      {/* Token 序列展示 */}
      <div
        className="p-3 rounded-xl border overflow-x-auto"
        style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
      >
        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>
          正在生成第 {genStep + 1}/{N} 个 Token
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {seq.tokens.map((tok, i) => (
            <span
              key={i}
              className="px-2 py-1 rounded text-xs font-mono transition-all"
              style={{
                backgroundColor: i < genStep ? "rgba(52,211,153,0.2)" : i === genStep ? "rgba(249,115,22,0.25)" : "var(--color-surface)",
                color: i < genStep ? "rgba(52,211,153,0.9)" : i === genStep ? "rgba(249,115,22,0.9)" : "var(--color-text-muted)",
                border: `1px solid ${i === genStep ? "rgba(249,115,22,0.5)" : "var(--color-border)"}`,
                fontWeight: i === genStep ? 700 : 400,
              }}
            >
              {tok}
            </span>
          ))}
        </div>
      </div>

      {/* 两栏对比 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 无 KV Cache */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_WASTED }} />
            <span className="text-xs font-semibold" style={{ color: "#f87171" }}>无 KV Cache</span>
          </div>
          <div
            className="p-3 rounded-xl border overflow-x-auto"
            style={{ backgroundColor: "var(--color-surface-2)", borderColor: "rgba(248,113,113,0.3)" }}
          >
            <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>
              每步重新计算所有前缀的 K、V
            </p>
            <svg width={W} height={(genStep + 1) * (CELL + GAP) + 4} style={{ display: "block" }}>
              {/* 列标题：token */}
              {seq.tokens.slice(0, genStep + 1).map((tok, col) => {
                const x = 2 + col * (CELL + GAP);
                return (
                  <text key={col} x={x + CELL / 2} y={0} textAnchor="middle" style={{ fontSize: "0.45rem", fill: "var(--color-text-muted)" }}>
                    {tok.slice(0, 4)}
                  </text>
                );
              })}
              {Array.from({ length: genStep + 1 }, (_, row) => (
                <g key={row}>
                  {Array.from({ length: row + 1 }, (_, col) => {
                    const x = 2 + col * (CELL + GAP);
                    const y = 8 + row * (CELL + GAP);
                    const isCurrent = col === row; // 当前生成的是最后一列
                    const isWaste   = col < row;   // 之前已算过，现在重算
                    const isPending = row > genStep;
                    return (
                      <g key={col}>
                        <rect
                          x={x} y={y} width={CELL} height={CELL} rx={3}
                          fill={isPending ? COLOR_PENDING : isWaste ? COLOR_WASTED : isCurrent ? COLOR_COMPUTE : COLOR_WASTED}
                          style={{ transition: "fill 0.3s" }}
                        />
                        <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle" style={{ fontSize: "0.5rem", fill: "white", opacity: 0.8 }}>
                          {isPending ? "" : isWaste ? "×" : "K,V"}
                        </text>
                      </g>
                    );
                  })}
                  {/* 当前步骤标签 */}
                  {row === genStep && (
                    <text x={2 + (row + 1) * (CELL + GAP) + 2} y={8 + row * (CELL + GAP) + CELL / 2 + 4} style={{ fontSize: "0.5rem", fill: "#f87171" }}>
                      ← 步骤 {row + 1}
                    </text>
                  )}
                </g>
              ))}
            </svg>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_COMPUTE }} />
                <span style={{ color: "var(--color-text-muted)" }}>新计算</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_WASTED }} />
                <span style={{ color: "var(--color-text-muted)" }}>重复计算（浪费）</span>
              </div>
            </div>
          </div>
          <div className="mt-2 p-2 rounded-lg text-xs font-mono text-center" style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
            已算 K,V：{totalWithout} 次
          </div>
        </div>

        {/* 有 KV Cache */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_CACHED }} />
            <span className="text-xs font-semibold" style={{ color: "rgba(52,211,153,0.9)" }}>有 KV Cache</span>
          </div>
          <div
            className="p-3 rounded-xl border overflow-x-auto"
            style={{ backgroundColor: "var(--color-surface-2)", borderColor: "rgba(52,211,153,0.3)" }}
          >
            <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>
              历史 K、V 缓存复用，只算新 Token
            </p>
            <svg width={W} height={(genStep + 1) * (CELL + GAP) + 4} style={{ display: "block" }}>
              {seq.tokens.slice(0, genStep + 1).map((tok, col) => {
                const x = 2 + col * (CELL + GAP);
                return (
                  <text key={col} x={x + CELL / 2} y={0} textAnchor="middle" style={{ fontSize: "0.45rem", fill: "var(--color-text-muted)" }}>
                    {tok.slice(0, 4)}
                  </text>
                );
              })}
              {Array.from({ length: genStep + 1 }, (_, row) => (
                <g key={row}>
                  {Array.from({ length: row + 1 }, (_, col) => {
                    const x = 2 + col * (CELL + GAP);
                    const y = 8 + row * (CELL + GAP);
                    const isNew     = col === row;
                    const isCached  = col < row;
                    return (
                      <g key={col}>
                        <rect
                          x={x} y={y} width={CELL} height={CELL} rx={3}
                          fill={isCached ? COLOR_CACHED : isNew ? COLOR_COMPUTE : COLOR_PENDING}
                          style={{ transition: "fill 0.3s" }}
                        />
                        <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle" style={{ fontSize: "0.5rem", fill: "white", opacity: 0.8 }}>
                          {isCached ? "↑" : isNew ? "K,V" : ""}
                        </text>
                      </g>
                    );
                  })}
                  {row === genStep && (
                    <text x={2 + (row + 1) * (CELL + GAP) + 2} y={8 + row * (CELL + GAP) + CELL / 2 + 4} style={{ fontSize: "0.5rem", fill: "rgba(52,211,153,0.9)" }}>
                      ← 步骤 {row + 1}
                    </text>
                  )}
                </g>
              ))}
            </svg>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_COMPUTE }} />
                <span style={{ color: "var(--color-text-muted)" }}>新计算</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_CACHED }} />
                <span style={{ color: "var(--color-text-muted)" }}>↑ 读缓存</span>
              </div>
            </div>
          </div>
          <div className="mt-2 p-2 rounded-lg text-xs font-mono text-center" style={{ backgroundColor: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", color: "rgba(52,211,153,0.9)" }}>
            已算 K,V：{totalWith} 次（节省 {savedPct}%）
          </div>
        </div>
      </div>

      {/* 控制 */}
      <div className="flex items-center gap-3">
        <button
          onClick={startPlay}
          disabled={playing}
          className="px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: "rgba(124,109,250,0.2)", color: "var(--color-accent)", border: "1px solid rgba(124,109,250,0.4)" }}
        >
          {playing ? "生成中..." : "▶ 自动演示"}
        </button>
        <input
          type="range" min={0} max={N - 1} value={genStep}
          onChange={(e) => { setPlaying(false); setGenStep(Number(e.target.value)); }}
          className="flex-1 accent-purple-500"
        />
        <span className="text-xs font-mono w-14 text-right" style={{ color: "var(--color-text-muted)" }}>
          {genStep + 1}/{N}
        </span>
      </div>

      {/* 总计比较 */}
      <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <p className="text-xs mb-3 font-semibold" style={{ color: "var(--color-text)" }}>
          完整生成 {N} 个 Token 的总 K,V 计算次数对比
        </p>
        <div className="space-y-2">
          {[
            { label: `无 KV Cache（Σ(1..${N}) = ${totalFull} 次）`, value: totalFull, max: totalFull, color: "#f87171" },
            { label: `有 KV Cache（每步仅算 1 次，共 ${N} 次）`, value: N, max: totalFull, color: "rgba(52,211,153,0.9)" },
          ].map(({ label, value, max, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs w-52 shrink-0" style={{ color: "var(--color-text-muted)" }}>{label}</span>
              <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: "var(--color-surface-2)" }}>
                <div className="h-3 rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
              </div>
              <span className="text-xs font-mono w-6" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
          时间复杂度：无缓存 O(n²)，有缓存 O(n)。长序列（2K token）节省约
          <span style={{ color: "rgba(52,211,153,0.9)", fontWeight: 600 }}> 99%+ </span>
          的 K/V 计算。
        </p>
      </div>

      {/* 说明 */}
      <div
        className="p-4 rounded-xl border text-xs leading-relaxed space-y-2"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <p>
          <strong style={{ color: "var(--color-text)" }}>为什么大模型推理这么慢？</strong>
          自回归生成每步只产生一个 Token，必须等上一步完成。KV Cache 将每层的 Key/Value 矩阵保存在 GPU 显存中，下一步直接复用。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>代价：显存占用。</strong>
          1个 Token 的 KV Cache ≈ 2 × 层数 × 头数 × 头维度 × 精度字节。LLaMA-70B 生成 2048 token 时 KV Cache 约占 5GB 显存。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>MQA / GQA：</strong>
          多查询注意力（MQA）和分组查询注意力（GQA）让多个 Q 头共享 K/V，大幅压缩 KV Cache 体积，LLaMA-2/3 已采用 GQA。
        </p>
      </div>
    </div>
  );
}
